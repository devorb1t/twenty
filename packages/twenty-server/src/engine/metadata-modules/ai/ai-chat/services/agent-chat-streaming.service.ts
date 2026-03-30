import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type Readable } from 'stream';

import { generateId, UI_MESSAGE_STREAM_HEADERS } from 'ai';
import { type Response } from 'express';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { type Repository } from 'typeorm';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/ai/ai-agent/agent.exception';
import { type BrowsingContextType } from 'src/engine/metadata-modules/ai/ai-agent/types/browsingContext.type';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import {
  STREAM_AGENT_CHAT_JOB_NAME,
  type StreamAgentChatJobData,
} from 'src/engine/metadata-modules/ai/ai-chat/jobs/stream-agent-chat.job';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';

import { AgentChatResumableStreamService } from './agent-chat-resumable-stream.service';

export type StreamAgentChatOptions = {
  threadId: string;
  userWorkspaceId: string;
  workspace: WorkspaceEntity;
  response: Response;
  messages: ExtendedUIMessage[];
  browsingContext: BrowsingContextType | null;
  modelId?: string;
};

const STREAM_READY_TIMEOUT_MS = 5_000;
const STREAM_READY_POLL_INTERVAL_MS = 50;

@Injectable()
export class AgentChatStreamingService {
  private readonly logger = new Logger(AgentChatStreamingService.name);

  constructor(
    @InjectRepository(AgentChatThreadEntity)
    private readonly threadRepository: Repository<AgentChatThreadEntity>,
    @InjectMessageQueue(MessageQueue.aiStreamQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly resumableStreamService: AgentChatResumableStreamService,
    private readonly agentChatService: AgentChatService,
  ) {}

  async streamAgentChat({
    threadId,
    userWorkspaceId,
    workspace,
    messages,
    browsingContext,
    response,
    modelId,
  }: StreamAgentChatOptions) {
    const thread = await this.threadRepository.findOne({
      where: {
        id: threadId,
        userWorkspaceId,
      },
    });

    if (!thread) {
      throw new AgentException(
        'Thread not found',
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }

    const streamId = generateId();
    const lastUserMessage = messages[messages.length - 1];
    const lastUserText =
      lastUserMessage?.parts.find((part) => part.type === 'text')?.text ?? '';

    await this.messageQueueService.add<StreamAgentChatJobData>(
      STREAM_AGENT_CHAT_JOB_NAME,
      {
        threadId: thread.id,
        streamId,
        userWorkspaceId,
        workspaceId: workspace.id,
        messages,
        browsingContext,
        modelId,
        lastUserMessageText: lastUserText,
        lastUserMessageParts: lastUserMessage?.parts ?? [],
        hasTitle: !!thread.title,
      },
    );

    await this.threadRepository.update(thread.id, {
      activeStreamId: streamId,
    });

    try {
      const result = await this.waitForResumableStream(streamId);

      if ('error' in result) {
        response.status(500).json(result.error);

        return;
      }

      if (!result.readable) {
        this.logger.error(
          `Stream ${streamId} did not become available within timeout`,
        );
        response
          .status(500)
          .json({ code: 'WORKER_UNREACHABLE', message: 'Stream timed out' });

        return;
      }

      response.writeHead(200, UI_MESSAGE_STREAM_HEADERS);
      result.readable.pipe(response);
    } catch (error) {
      response.end();
      throw error;
    }
  }

  async flushNextQueuedMessage(
    threadId: string,
    userWorkspaceId: string,
    workspaceId: string,
  ): Promise<void> {
    const queuedMessages =
      await this.agentChatService.getQueuedMessages(threadId);

    if (queuedMessages.length === 0) {
      return;
    }

    const nextMessage = queuedMessages[0];
    const textPart = nextMessage.parts?.find((part) => part.type === 'text');
    const messageText = textPart?.textContent ?? '';

    if (messageText === '') {
      await this.agentChatService.deleteQueuedMessage(nextMessage.id, threadId);

      return;
    }

    // Promote the queued message to sent status
    await this.agentChatService.promoteQueuedMessage(nextMessage.id);

    const thread = await this.threadRepository.findOne({
      where: { id: threadId },
    });

    if (!thread) {
      return;
    }

    // Fetch all sent messages for this thread to build full conversation
    const allMessages = await this.agentChatService.getMessagesForThread(
      threadId,
      userWorkspaceId,
    );

    // Build ExtendedUIMessage array from DB messages for the stream job
    const uiMessages = allMessages
      .filter((message) => message.status !== 'queued')
      .map((message) => ({
        id: message.id,
        role: message.role as 'user' | 'assistant' | 'system',
        parts: (message.parts ?? []).map((part) => {
          if (part.type === 'text') {
            return { type: 'text' as const, text: part.textContent ?? '' };
          }

          return { type: part.type as 'text', text: '' };
        }),
        createdAt: message.createdAt,
      }));

    const streamId = generateId();

    await this.messageQueueService.add<StreamAgentChatJobData>(
      STREAM_AGENT_CHAT_JOB_NAME,
      {
        threadId,
        streamId,
        userWorkspaceId,
        workspaceId,
        messages: uiMessages,
        browsingContext: null,
        lastUserMessageText: messageText,
        lastUserMessageParts: [{ type: 'text', text: messageText }],
        hasTitle: !!thread.title,
      },
    );

    await this.threadRepository.update(threadId, {
      activeStreamId: streamId,
    });
  }

  private async waitForResumableStream(
    streamId: string,
  ): Promise<
    | { readable: Readable }
    | { error: { code: string; message: string } }
    | { readable: null }
  > {
    const maxAttempts = Math.ceil(
      STREAM_READY_TIMEOUT_MS / STREAM_READY_POLL_INTERVAL_MS,
    );

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const streamError =
        await this.resumableStreamService.readStreamError(streamId);

      if (streamError) {
        return { error: streamError };
      }

      const readable =
        await this.resumableStreamService.resumeExistingStreamAsNodeReadable(
          streamId,
        );

      if (readable) {
        return { readable };
      }

      await new Promise((resolve) =>
        setTimeout(resolve, STREAM_READY_POLL_INTERVAL_MS),
      );
    }

    return { readable: null };
  }
}
