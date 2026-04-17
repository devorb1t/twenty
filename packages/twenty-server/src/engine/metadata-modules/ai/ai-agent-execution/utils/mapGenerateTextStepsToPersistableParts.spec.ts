import { type StepResult, type ToolSet } from 'ai';

import { mapGenerateTextStepsToPersistableParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/mapGenerateTextStepsToPersistableParts';

describe('mapGenerateTextStepsToPersistableParts', () => {
  it('maps supported step content parts without dropping workflow trace data', async () => {
    const uploadGeneratedFile = jest.fn().mockResolvedValue({
      fileId: 'file-1',
      filename: 'workflow-trace-step-1-part-6.pdf',
    });

    const steps = [
      {
        content: [
          { type: 'text', text: '' },
          { type: 'text', text: 'Answer' },
          { type: 'reasoning', text: 'Plan' },
          {
            type: 'source',
            sourceType: 'url',
            id: 'source-url-1',
            url: 'https://example.com',
            title: 'Example',
          },
          {
            type: 'source',
            sourceType: 'document',
            id: 'source-document-1',
            mediaType: 'application/pdf',
            title: 'Spec',
            filename: 'spec.pdf',
          },
          {
            type: 'file',
            file: {
              base64: 'SGVsbG8=',
              uint8Array: new Uint8Array([72, 101, 108, 108, 111]),
              mediaType: 'application/pdf',
            },
          },
          {
            type: 'tool-call',
            toolName: 'search',
            toolCallId: 'tool-call-1',
            input: { query: 'hello' },
          },
          {
            type: 'tool-result',
            toolName: 'search',
            toolCallId: 'tool-call-1',
            input: { query: 'hello' },
            output: { answer: 'world' },
          },
          {
            type: 'tool-error',
            toolName: 'search',
            toolCallId: 'tool-call-2',
            input: { query: 'oops' },
            error: new Error('boom'),
          },
          {
            type: 'tool-approval-request',
            approvalId: 'approval-1',
            toolCall: {
              toolName: 'approve_search',
              toolCallId: 'tool-call-3',
              input: { query: 'hold' },
            },
          },
        ],
      },
      {
        content: [{ type: 'text', text: 'Second step' }],
      },
    ] as StepResult<ToolSet>[];

    const parts = await mapGenerateTextStepsToPersistableParts({
      steps,
      uploadGeneratedFile,
    });

    expect(uploadGeneratedFile).toHaveBeenCalledWith({
      file: Buffer.from([72, 101, 108, 108, 111]),
      filename: 'workflow-trace-step-1-part-6.pdf',
    });

    expect(parts).toEqual([
      { type: 'text', text: 'Answer' },
      { type: 'reasoning', text: 'Plan', state: 'done' },
      {
        type: 'source-url',
        sourceId: 'source-url-1',
        url: 'https://example.com',
        title: 'Example',
        providerMetadata: undefined,
      },
      {
        type: 'source-document',
        sourceId: 'source-document-1',
        mediaType: 'application/pdf',
        title: 'Spec',
        filename: 'spec.pdf',
        providerMetadata: undefined,
      },
      {
        type: 'file',
        fileId: 'file-1',
        filename: 'workflow-trace-step-1-part-6.pdf',
      },
      {
        type: 'tool-search',
        toolName: 'search',
        toolCallId: 'tool-call-1',
        input: { query: 'hello' },
        state: 'input-available',
      },
      {
        type: 'tool-search',
        toolName: 'search',
        toolCallId: 'tool-call-1',
        input: { query: 'hello' },
        output: { answer: 'world' },
        state: 'output-available',
      },
      {
        type: 'tool-search',
        toolName: 'search',
        toolCallId: 'tool-call-2',
        input: { query: 'oops' },
        errorText: 'Error: boom',
        state: 'output-error',
      },
      {
        type: 'tool-approve_search',
        toolName: 'approve_search',
        toolCallId: 'tool-call-3',
        input: { query: 'hold' },
        state: 'approval-requested',
        approval: { id: 'approval-1' },
      },
      { type: 'step-start' },
      { type: 'text', text: 'Second step' },
    ]);
  });
});
