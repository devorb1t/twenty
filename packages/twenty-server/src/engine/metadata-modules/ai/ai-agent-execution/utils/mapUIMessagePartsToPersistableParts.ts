import { type DynamicToolUIPart, type ToolUIPart } from 'ai';
import {
  isExtendedFileUIPart,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';

import { type PersistableAgentMessagePart } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/persistable-agent-message-part.type';

type PersistableToolUIPart = DynamicToolUIPart | ToolUIPart;
type PersistableToolPartState = Extract<
  PersistableAgentMessagePart,
  { type: `tool-${string}` }
>['state'];

const isPersistableToolUIPart = (
  part: ExtendedUIMessagePart,
): part is PersistableToolUIPart => {
  return (
    'toolCallId' in part &&
    (part.type === 'dynamic-tool' || part.type.startsWith('tool-'))
  );
};

const normalizePersistableToolState = (
  state: PersistableToolUIPart['state'],
): PersistableToolPartState => {
  if (state === 'approval-requested' || state === 'approval-responded') {
    return 'input-available';
  }

  return state;
};

const assertUnreachable = (value: never): never => {
  throw new Error(`Unsupported UI message part: ${JSON.stringify(value)}`);
};

export const mapUIMessagePartsToPersistableParts = (
  uiMessageParts: ExtendedUIMessagePart[],
): PersistableAgentMessagePart[] => {
  const persistableParts: PersistableAgentMessagePart[] = [];

  for (const part of uiMessageParts) {
    if (isPersistableToolUIPart(part)) {
      const toolName =
        part.type === 'dynamic-tool'
          ? part.toolName
          : part.type.slice('tool-'.length);

      persistableParts.push({
        type: `tool-${toolName}` as const,
        toolName,
        toolCallId: part.toolCallId,
        input: part.input,
        output: 'output' in part ? part.output : undefined,
        errorText: 'errorText' in part ? part.errorText : undefined,
        state: normalizePersistableToolState(part.state),
      });
      continue;
    }

    switch (part.type) {
      case 'text':
        persistableParts.push({
          type: 'text',
          text: part.text,
        });
        break;
      case 'reasoning':
        persistableParts.push({
          type: 'reasoning',
          text: part.text,
          state: part.state,
        });
        break;
      case 'file':
        if (!isExtendedFileUIPart(part)) {
          throw new Error('Expected file part');
        }

        persistableParts.push({
          type: 'file',
          filename: part.filename ?? null,
          fileId: part.fileId,
        });
        break;
      case 'source-url':
        persistableParts.push({
          type: 'source-url',
          sourceId: part.sourceId,
          url: part.url,
          title: part.title ?? '',
          providerMetadata: part.providerMetadata,
        });
        break;
      case 'source-document':
        persistableParts.push({
          type: 'source-document',
          sourceId: part.sourceId,
          mediaType: part.mediaType,
          title: part.title,
          filename: part.filename,
          providerMetadata: part.providerMetadata,
        });
        break;
      case 'step-start':
        persistableParts.push({
          type: 'step-start',
        });
        break;
      case 'data-compaction':
        break;
      case 'data-routing-status':
        persistableParts.push({
          type: 'data-routing-status',
          text: part.data.text,
          state: part.data.state,
        });
        break;
      case 'data-code-execution':
        // Code execution parts are streamed during execution but don't need
        // to be persisted - the final result is captured in the tool part.
        break;
      case 'data-thread-title':
        // Thread title is a transient notification for the client.
        break;
      default:
        assertUnreachable(part);
    }
  }

  return persistableParts;
};
