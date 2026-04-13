import type { PartialBlock } from '@blocknote/core';

import { ensureBlockIds } from '@/blocknote-editor/utils/ensureBlockIds';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe('ensureBlockIds', () => {
  it('should add id to a block without one', () => {
    const blocks: PartialBlock[] = [{ type: 'paragraph', content: 'hello' }];
    const result = ensureBlockIds(blocks);

    expect(result[0].id).toMatch(UUID_REGEX);
  });

  it('should preserve existing valid id', () => {
    const blocks: PartialBlock[] = [
      { id: 'existing-id', type: 'paragraph', content: 'hello' },
    ];
    const result = ensureBlockIds(blocks);

    expect(result[0].id).toBe('existing-id');
  });

  it('should replace empty string id', () => {
    const blocks: PartialBlock[] = [
      { id: '', type: 'paragraph', content: 'hello' },
    ];
    const result = ensureBlockIds(blocks);

    expect(result[0].id).toMatch(UUID_REGEX);
  });

  it('should handle nested children blocks', () => {
    const blocks: PartialBlock[] = [
      {
        type: 'paragraph',
        children: [{ type: 'paragraph', content: 'nested' }],
      },
    ];
    const result = ensureBlockIds(blocks);

    expect(result[0].id).toMatch(UUID_REGEX);
    expect(result[0].children?.[0]?.id).toMatch(UUID_REGEX);
  });

  it('should not mutate the original blocks', () => {
    const blocks: PartialBlock[] = [{ type: 'paragraph', content: 'hello' }];
    ensureBlockIds(blocks);

    expect(blocks[0].id).toBeUndefined();
  });

  it('should handle empty children array', () => {
    const blocks: PartialBlock[] = [
      { type: 'paragraph', children: [], content: 'hello' },
    ];
    const result = ensureBlockIds(blocks);

    expect(result[0].id).toMatch(UUID_REGEX);
    expect(result[0].children).toEqual([]);
  });
});
