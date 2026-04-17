import { type StepResult, type ToolSet } from 'ai';

import { type PersistableAgentMessagePart } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/persistable-agent-message-part.type';

const GENERATED_FILE_EXTENSION_OVERRIDES: Record<string, string> = {
  'application/json': 'json',
  'application/pdf': 'pdf',
  'application/xml': 'xml',
  'image/jpeg': 'jpg',
  'image/svg+xml': 'svg',
  'text/csv': 'csv',
  'text/html': 'html',
  'text/markdown': 'md',
  'text/plain': 'txt',
  'text/xml': 'xml',
};

const getGeneratedFileExtension = (mediaType: string) => {
  const overriddenExtension = GENERATED_FILE_EXTENSION_OVERRIDES[mediaType];

  if (overriddenExtension) {
    return overriddenExtension;
  }

  const rawSubtype = mediaType.split('/')[1]?.split(';')[0];
  const sanitizedSubtype = rawSubtype?.replace(/[^a-z0-9.+-]/gi, '-');

  return sanitizedSubtype || 'bin';
};

const buildGeneratedFileFilename = ({
  mediaType,
  partIndex,
  stepIndex,
}: {
  mediaType: string;
  partIndex: number;
  stepIndex: number;
}) => {
  const extension = getGeneratedFileExtension(mediaType);

  return `workflow-trace-step-${stepIndex + 1}-part-${partIndex + 1}.${extension}`;
};

const assertUnreachable = (value: never): never => {
  throw new Error(`Unsupported content part: ${JSON.stringify(value)}`);
};

export const mapGenerateTextStepsToPersistableParts = async ({
  steps,
  uploadGeneratedFile,
}: {
  steps: StepResult<ToolSet>[];
  uploadGeneratedFile: (args: {
    file: Buffer;
    filename: string;
  }) => Promise<{ fileId: string; filename: string | null }>;
}): Promise<PersistableAgentMessagePart[]> => {
  const parts: PersistableAgentMessagePart[] = [];

  for (const [stepIndex, step] of steps.entries()) {
    if (stepIndex > 0) {
      parts.push({ type: 'step-start' });
    }

    for (const [partIndex, contentPart] of step.content.entries()) {
      switch (contentPart.type) {
        case 'text':
          if (contentPart.text.length > 0) {
            parts.push({ type: 'text', text: contentPart.text });
          }
          break;
        case 'reasoning':
          parts.push({
            type: 'reasoning',
            text: contentPart.text,
            state: 'done',
          });
          break;
        case 'source':
          if (contentPart.sourceType === 'url') {
            parts.push({
              type: 'source-url',
              sourceId: contentPart.id,
              url: contentPart.url,
              title: contentPart.title ?? '',
              providerMetadata: contentPart.providerMetadata,
            });
          } else {
            parts.push({
              type: 'source-document',
              sourceId: contentPart.id,
              mediaType: contentPart.mediaType,
              title: contentPart.title,
              filename: contentPart.filename,
              providerMetadata: contentPart.providerMetadata,
            });
          }
          break;
        case 'file': {
          const filename = buildGeneratedFileFilename({
            mediaType: contentPart.file.mediaType,
            partIndex,
            stepIndex,
          });
          const uploadedFile = await uploadGeneratedFile({
            file: Buffer.from(contentPart.file.uint8Array),
            filename,
          });

          parts.push({
            type: 'file',
            fileId: uploadedFile.fileId,
            filename: uploadedFile.filename,
          });
          break;
        }
        case 'tool-call':
          parts.push({
            type: `tool-${contentPart.toolName}`,
            toolName: contentPart.toolName,
            toolCallId: contentPart.toolCallId,
            input: contentPart.input,
            state: 'input-available',
          });
          break;
        case 'tool-result':
          parts.push({
            type: `tool-${contentPart.toolName}`,
            toolName: contentPart.toolName,
            toolCallId: contentPart.toolCallId,
            input: contentPart.input,
            output: contentPart.output,
            state: 'output-available',
          });
          break;
        case 'tool-error':
          parts.push({
            type: `tool-${contentPart.toolName}`,
            toolName: contentPart.toolName,
            toolCallId: contentPart.toolCallId,
            input: contentPart.input,
            errorText: String(contentPart.error),
            state: 'output-error',
          });
          break;
        case 'tool-approval-request':
          parts.push({
            type: `tool-${contentPart.toolCall.toolName}`,
            toolName: contentPart.toolCall.toolName,
            toolCallId: contentPart.toolCall.toolCallId,
            input: contentPart.toolCall.input,
            state: 'approval-requested',
            approval: {
              id: contentPart.approvalId,
            },
          });
          break;
        default:
          assertUnreachable(contentPart);
      }
    }
  }

  return parts;
};
