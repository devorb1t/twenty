import {
  type ExtendedFileUIPart,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';

import { mapUIMessagePartsToPersistableParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/mapUIMessagePartsToPersistableParts';

describe('mapUIMessagePartsToPersistableParts', () => {
  const sourceDocumentPart: ExtendedUIMessagePart = {
    type: 'source-document',
    sourceId: 'source-document-1',
    mediaType: 'application/pdf',
    title: 'Spec',
    filename: 'spec.pdf',
  };

  const filePart: ExtendedFileUIPart = {
    type: 'file',
    mediaType: 'text/plain',
    filename: 'notes.txt',
    url: 'https://example.com/notes.txt',
    fileId: 'file-1',
  };

  const dynamicToolPart = {
    type: 'dynamic-tool',
    toolName: 'search',
    toolCallId: 'tool-call-1',
    input: { query: 'hello' },
    state: 'approval-requested',
  } as ExtendedUIMessagePart;

  const threadTitlePart = {
    type: 'data-thread-title',
    data: { title: 'Ignore me' },
  } as ExtendedUIMessagePart;

  it.each([
    {
      name: 'source document parts',
      parts: [sourceDocumentPart],
      expected: [
        {
          type: 'source-document',
          sourceId: 'source-document-1',
          mediaType: 'application/pdf',
          title: 'Spec',
          filename: 'spec.pdf',
          providerMetadata: undefined,
        },
      ],
    },
    {
      name: 'file parts',
      parts: [filePart],
      expected: [{ type: 'file', fileId: 'file-1', filename: 'notes.txt' }],
    },
    {
      name: 'dynamic tool parts with approval states',
      parts: [dynamicToolPart],
      expected: [
        {
          type: 'tool-search',
          toolName: 'search',
          toolCallId: 'tool-call-1',
          input: { query: 'hello' },
          state: 'input-available',
        },
      ],
    },
    {
      name: 'transient title parts',
      parts: [threadTitlePart],
      expected: [],
    },
  ])('maps $name', ({ parts, expected }) => {
    expect(mapUIMessagePartsToPersistableParts(parts)).toEqual(expected);
  });
});
