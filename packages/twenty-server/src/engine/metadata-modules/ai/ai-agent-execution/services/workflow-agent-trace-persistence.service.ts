import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type StepResult, type ToolSet } from 'ai';
import { EntityManager, Repository } from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import {
  AgentMessageEntity,
  AgentMessageRole,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { AgentMessagePartEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message-part.entity';
import { AgentTurnEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-turn.entity';
import { mapGenerateTextStepsToPersistableParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/mapGenerateTextStepsToPersistableParts';
import { mapPersistablePartsToDBParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/mapPersistablePartsToDBParts';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { FileAIChatService } from 'src/engine/core-modules/file/file-ai-chat/services/file-ai-chat.service';

const MAX_THREAD_TITLE_LENGTH = 100;

@Injectable()
export class WorkflowAgentTracePersistenceService {
  private readonly logger = new Logger(
    WorkflowAgentTracePersistenceService.name,
  );

  constructor(
    @InjectRepository(AgentChatThreadEntity)
    private readonly threadRepository: Repository<AgentChatThreadEntity>,
    private readonly fileAIChatService: FileAIChatService,
  ) {}

  async persistTrace({
    steps,
    userPrompt,
    agentId,
    workspaceId,
    workflowRunId,
    workflowStepId,
    totalInputTokens,
    totalOutputTokens,
    totalInputCredits,
    totalOutputCredits,
    contextWindowTokens,
    conversationSize,
  }: {
    steps: StepResult<ToolSet>[];
    userPrompt: string;
    agentId: string | null;
    workspaceId: string;
    workflowRunId: string;
    workflowStepId: string;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalInputCredits: number;
    totalOutputCredits: number;
    contextWindowTokens: number;
    conversationSize: number;
  }): Promise<{ turnId: string; threadId: string }> {
    const title = userPrompt.substring(0, MAX_THREAD_TITLE_LENGTH);
    const persistableParts = await mapGenerateTextStepsToPersistableParts({
      steps,
      uploadGeneratedFile: async ({ file, filename }) => {
        // Files are uploaded before the DB transaction; a later transaction
        // failure can leave orphan uploads, which is acceptable here because
        // the files are cheap to regenerate and keeping DB transactions short
        // matters more than strict storage rollback.
        const uploadedFile = await this.fileAIChatService.uploadFile({
          file,
          filename,
          workspaceId,
        });

        return {
          fileId: uploadedFile.id,
          filename,
        };
      },
    });

    const persistedTrace = await this.threadRepository.manager.transaction(
      async (entityManager) => {
        const threadId = await this.getOrCreateWorkflowTraceThread({
          entityManager,
          workspaceId,
          title,
          workflowRunId,
          workflowStepId,
          totalInputTokens,
          totalOutputTokens,
          totalInputCredits,
          totalOutputCredits,
          contextWindowTokens,
          conversationSize,
        });
        const turnId = await this.insertTurn({
          entityManager,
          threadId,
          agentId,
          workspaceId,
        });
        const userMessageId = await this.insertUserMessage({
          entityManager,
          threadId,
          turnId,
          workspaceId,
        });

        await entityManager.getRepository(AgentMessagePartEntity).insert({
          messageId: userMessageId,
          orderIndex: 0,
          type: 'text',
          textContent: userPrompt,
          workspaceId,
        });

        const assistantMessageId = await this.insertAssistantMessage({
          entityManager,
          threadId,
          turnId,
          agentId,
          workspaceId,
        });

        if (persistableParts.length > 0) {
          const dbParts = mapPersistablePartsToDBParts(
            persistableParts,
            assistantMessageId,
            workspaceId,
          );

          if (dbParts.length > 0) {
            await entityManager
              .getRepository(AgentMessagePartEntity)
              .insert(
                dbParts as QueryDeepPartialEntity<AgentMessagePartEntity>[],
              );
          }
        }

        return { turnId, threadId };
      },
    );

    this.logger.log(
      `Persisted workflow agent trace: turnId=${persistedTrace.turnId} threadId=${persistedTrace.threadId} steps=${steps.length} parts=${persistableParts.length}`,
    );

    return persistedTrace;
  }

  private async getOrCreateWorkflowTraceThread({
    entityManager,
    workspaceId,
    title,
    workflowRunId,
    workflowStepId,
    totalInputTokens,
    totalOutputTokens,
    totalInputCredits,
    totalOutputCredits,
    contextWindowTokens,
    conversationSize,
  }: {
    entityManager: EntityManager;
    workspaceId: string;
    title: string;
    workflowRunId: string;
    workflowStepId: string;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalInputCredits: number;
    totalOutputCredits: number;
    contextWindowTokens: number;
    conversationSize: number;
  }) {
    const threadRepository = entityManager.getRepository(AgentChatThreadEntity);
    // Workflow actions currently execute sequentially for a given
    // (workspaceId, workflowRunId, workflowStepId), so this read-then-insert
    // flow is sufficient despite the usual TOCTOU caveat.
    const existingThread = await threadRepository.findOne({
      where: {
        workspaceId,
        workflowRunId,
        workflowStepId,
      },
      select: ['id'],
    });

    const threadInsertPayload = {
      title,
      totalInputTokens,
      totalOutputTokens,
      totalInputCredits,
      totalOutputCredits,
      contextWindowTokens,
      conversationSize,
    };

    if (existingThread) {
      await threadRepository.update(existingThread.id, {
        title,
        totalInputTokens: () => `"totalInputTokens" + ${totalInputTokens}`,
        totalOutputTokens: () => `"totalOutputTokens" + ${totalOutputTokens}`,
        totalInputCredits: () => `"totalInputCredits" + ${totalInputCredits}`,
        totalOutputCredits: () =>
          `"totalOutputCredits" + ${totalOutputCredits}`,
        contextWindowTokens,
        conversationSize,
      });

      return existingThread.id;
    }

    const insertResult = await threadRepository.insert({
      workspaceId,
      userWorkspaceId: null,
      workflowRunId,
      workflowStepId,
      ...threadInsertPayload,
    });

    return insertResult.identifiers[0].id as string;
  }

  private async insertTurn({
    entityManager,
    threadId,
    agentId,
    workspaceId,
  }: {
    entityManager: EntityManager;
    threadId: string;
    agentId: string | null;
    workspaceId: string;
  }) {
    const insertResult = await entityManager
      .getRepository(AgentTurnEntity)
      .insert({
        threadId,
        agentId,
        workspaceId,
      });

    return insertResult.identifiers[0].id as string;
  }

  private async insertUserMessage({
    entityManager,
    threadId,
    turnId,
    workspaceId,
  }: {
    entityManager: EntityManager;
    threadId: string;
    turnId: string;
    workspaceId: string;
  }) {
    const insertResult = await entityManager
      .getRepository(AgentMessageEntity)
      .insert({
        threadId,
        turnId,
        role: AgentMessageRole.USER,
        processedAt: new Date(),
        workspaceId,
      });

    return insertResult.identifiers[0].id as string;
  }

  private async insertAssistantMessage({
    entityManager,
    threadId,
    turnId,
    agentId,
    workspaceId,
  }: {
    entityManager: EntityManager;
    threadId: string;
    turnId: string;
    agentId: string | null;
    workspaceId: string;
  }) {
    const insertResult = await entityManager
      .getRepository(AgentMessageEntity)
      .insert({
        threadId,
        turnId,
        role: AgentMessageRole.ASSISTANT,
        agentId,
        processedAt: new Date(),
        workspaceId,
      });

    return insertResult.identifiers[0].id as string;
  }
}
