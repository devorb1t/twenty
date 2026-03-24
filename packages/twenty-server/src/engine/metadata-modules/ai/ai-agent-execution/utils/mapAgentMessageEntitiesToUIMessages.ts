import { type ToolUIPart } from 'ai';
import { type ExtendedUIMessage, type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { type AgentMessagePartEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message-part.entity';
import { type AgentMessageEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';

const mapAgentMessagePartEntityToUIMessagePart = (
  part: AgentMessagePartEntity,
): ExtendedUIMessagePart | null => {
  switch (part.type) {
    case 'text':
      return { type: 'text', text: part.textContent ?? '' };
    case 'reasoning':
      return { type: 'reasoning', text: part.reasoningContent ?? '', state: 'done' as const };
    case 'step-start':
      return { type: 'step-start' };
    case 'source-url':
      return {
        type: 'source-url',
        sourceId: part.sourceUrlSourceId ?? '',
        url: part.sourceUrlUrl ?? '',
        title: part.sourceUrlTitle ?? undefined,
        providerMetadata: part.providerMetadata ?? undefined,
      };
    default: {
      if (part.type.includes('tool-') && part.toolCallId) {
        return {
          type: part.type as `tool-${string}`,
          toolCallId: part.toolCallId,
          input: part.toolInput ?? {},
          output: part.toolOutput ?? undefined,
          errorText: part.errorMessage ?? undefined,
          state: part.state ?? undefined,
        } as ToolUIPart;
      }
      return null;
    }
  }
};

export const mapAgentMessageEntitiesToUIMessages = (
  messageEntities: AgentMessageEntity[],
): ExtendedUIMessage[] => {
  return messageEntities.map((message) => ({
    id: message.id,
    role: message.role as ExtendedUIMessage['role'],
    parts: (message.parts ?? [])
      .sort((partA, partB) => partA.orderIndex - partB.orderIndex)
      .map(mapAgentMessagePartEntityToUIMessagePart)
      .filter((part): part is ExtendedUIMessagePart => part !== null),
    metadata: { createdAt: message.createdAt.toISOString() },
  }));
};
