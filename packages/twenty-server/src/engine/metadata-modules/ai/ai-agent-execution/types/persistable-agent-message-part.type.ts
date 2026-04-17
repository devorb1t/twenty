import { type JSONValue } from 'ai';

type PersistableProviderMetadata = Record<
  string,
  Record<string, JSONValue | undefined>
>;

type PersistableTextPart = {
  type: 'text';
  text: string;
};

type PersistableReasoningPart = {
  type: 'reasoning';
  text: string;
  state?: 'streaming' | 'done';
};

type PersistableFilePart = {
  type: 'file';
  fileId: string;
  filename: string | null;
};

type PersistableSourceUrlPart = {
  type: 'source-url';
  sourceId: string;
  url: string;
  title: string;
  providerMetadata?: PersistableProviderMetadata;
};

type PersistableSourceDocumentPart = {
  type: 'source-document';
  sourceId: string;
  mediaType: string;
  title: string;
  filename?: string;
  providerMetadata?: PersistableProviderMetadata;
};

type PersistableStepStartPart = {
  type: 'step-start';
};

type PersistableRoutingStatusPart = {
  type: 'data-routing-status';
  text: string;
  state: string;
};

type PersistableToolPart = {
  type: `tool-${string}`;
  toolName: string;
  toolCallId: string;
  input: unknown;
  state:
    | 'input-streaming'
    | 'input-available'
    | 'output-available'
    | 'output-error'
    | 'output-denied';
  output?: unknown;
  errorText?: string;
};

export type PersistableAgentMessagePart =
  | PersistableFilePart
  | PersistableReasoningPart
  | PersistableRoutingStatusPart
  | PersistableSourceDocumentPart
  | PersistableSourceUrlPart
  | PersistableStepStartPart
  | PersistableTextPart
  | PersistableToolPart;
