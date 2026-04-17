import { type StepResult, type ToolSet } from 'ai';

import { FileAIChatService } from 'src/engine/core-modules/file/file-ai-chat/services/file-ai-chat.service';
import { AgentMessagePartEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message-part.entity';
import { AgentMessageEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { AgentTurnEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-turn.entity';
import { WorkflowAgentTracePersistenceService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/workflow-agent-trace-persistence.service';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';

const createInsertResult = (id: string) =>
  ({
    identifiers: [{ id }],
  }) as never;

describe('WorkflowAgentTracePersistenceService', () => {
  it('reuses the workflow trace thread when the same step executes again', async () => {
    const threadEntityRepository = {
      findOne: jest
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'thread-1' }),
      insert: jest.fn().mockResolvedValue(createInsertResult('thread-1')),
      update: jest.fn().mockResolvedValue(undefined),
    };
    const turnRepository = {
      insert: jest
        .fn()
        .mockResolvedValueOnce(createInsertResult('turn-1'))
        .mockResolvedValueOnce(createInsertResult('turn-2')),
    };
    const messageRepository = {
      insert: jest
        .fn()
        .mockResolvedValueOnce(createInsertResult('user-message-1'))
        .mockResolvedValueOnce(createInsertResult('assistant-message-1'))
        .mockResolvedValueOnce(createInsertResult('user-message-2'))
        .mockResolvedValueOnce(createInsertResult('assistant-message-2')),
    };
    const messagePartRepository = {
      insert: jest.fn().mockResolvedValue(undefined),
    };

    const entityManager = {
      getRepository: jest.fn((entity) => {
        if (entity === AgentChatThreadEntity) {
          return threadEntityRepository;
        }
        if (entity === AgentTurnEntity) {
          return turnRepository;
        }
        if (entity === AgentMessageEntity) {
          return messageRepository;
        }
        if (entity === AgentMessagePartEntity) {
          return messagePartRepository;
        }

        throw new Error(`Unexpected entity: ${String(entity)}`);
      }),
    };

    const threadRepository = {
      manager: {
        transaction: jest.fn(async (callback) => callback(entityManager)),
      },
    } as never;
    const fileAIChatService = {
      uploadFile: jest.fn(),
    } as unknown as jest.Mocked<FileAIChatService>;

    const service = new WorkflowAgentTracePersistenceService(
      threadRepository,
      fileAIChatService,
    );
    const steps = [
      {
        content: [{ type: 'text', text: 'Answer' }],
      },
    ] as StepResult<ToolSet>[];

    const firstPersistedTrace = await service.persistTrace({
      steps,
      userPrompt: 'First prompt',
      agentId: 'agent-1',
      workspaceId: 'workspace-1',
      workflowRunId: 'workflow-run-1',
      workflowStepId: 'workflow-step-1',
      totalInputTokens: 10,
      totalOutputTokens: 20,
      totalInputCredits: 30,
      totalOutputCredits: 40,
      contextWindowTokens: 50,
      conversationSize: 60,
    });

    const secondPersistedTrace = await service.persistTrace({
      steps,
      userPrompt: 'Second prompt',
      agentId: 'agent-1',
      workspaceId: 'workspace-1',
      workflowRunId: 'workflow-run-1',
      workflowStepId: 'workflow-step-1',
      totalInputTokens: 11,
      totalOutputTokens: 21,
      totalInputCredits: 31,
      totalOutputCredits: 41,
      contextWindowTokens: 51,
      conversationSize: 61,
    });

    expect(firstPersistedTrace).toEqual({
      turnId: 'turn-1',
      threadId: 'thread-1',
    });
    expect(secondPersistedTrace).toEqual({
      turnId: 'turn-2',
      threadId: 'thread-1',
    });
    expect(threadEntityRepository.insert).toHaveBeenCalledTimes(1);
    expect(threadEntityRepository.update).toHaveBeenCalledWith(
      'thread-1',
      expect.objectContaining({
        title: 'Second prompt',
        totalInputTokens: expect.any(Function),
        totalOutputTokens: expect.any(Function),
        totalInputCredits: expect.any(Function),
        totalOutputCredits: expect.any(Function),
        contextWindowTokens: 51,
        conversationSize: 61,
      }),
    );

    const updatePayload = threadEntityRepository.update.mock.calls[0][1];

    expect(updatePayload.totalInputTokens()).toBe('"totalInputTokens" + 11');
    expect(updatePayload.totalOutputTokens()).toBe('"totalOutputTokens" + 21');
    expect(updatePayload.totalInputCredits()).toBe('"totalInputCredits" + 31');
    expect(updatePayload.totalOutputCredits()).toBe(
      '"totalOutputCredits" + 41',
    );
    expect(messagePartRepository.insert).toHaveBeenCalledTimes(4);
    expect(fileAIChatService.uploadFile).not.toHaveBeenCalled();
  });
});
