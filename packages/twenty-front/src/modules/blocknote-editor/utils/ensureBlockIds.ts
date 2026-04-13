import type { PartialBlock } from '@blocknote/core';
import { isNonEmptyString } from '@sniptt/guards';
import { v4 } from 'uuid';

// Recursively ensures every block has a valid `id`.
// BlockNote 0.47.x throws "Block doesn't have id" during ProseMirror
// view creation if any block is missing its id attribute — even though
// PartialBlock allows omitting it.
export const ensureBlockIds = (blocks: PartialBlock[]): PartialBlock[] => {
  let patchedCount = 0;

  const result = blocks.map((block) => {
    const patchedBlock = { ...block };

    if (!isNonEmptyString(patchedBlock.id)) {
      patchedBlock.id = v4();
      patchedCount++;
    }

    if (
      Array.isArray(patchedBlock.children) &&
      patchedBlock.children.length > 0
    ) {
      patchedBlock.children = ensureBlockIds(
        patchedBlock.children as PartialBlock[],
      );
    }

    return patchedBlock;
  });

  if (patchedCount > 0) {
    // oxlint-disable-next-line no-console
    console.warn(
      `[BlockNote] Patched ${patchedCount} block(s) missing id attribute`,
    );
  }

  return result;
};
