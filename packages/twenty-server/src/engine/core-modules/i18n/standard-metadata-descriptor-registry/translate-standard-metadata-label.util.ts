import { type I18n } from '@lingui/core';

import { standardMetadataDescriptorByMessage } from 'src/engine/core-modules/i18n/standard-metadata-descriptor-registry/standard-metadata-descriptor-by-message.state';

// Skips Lingui's `_()` when the catalog is missing the id, which would
// otherwise trigger "Uncompiled message detected" warnings.
export const translateStandardMetadataLabel = (
  i18n: I18n,
  label: string | null | undefined,
): string | undefined => {
  if (label == null || label === '') {
    return undefined;
  }

  const descriptor = standardMetadataDescriptorByMessage.get(label);

  if (descriptor === undefined) {
    return undefined;
  }

  const id = descriptor.id;

  if (typeof id === 'string' && i18n.messages?.[id] !== undefined) {
    return i18n._(descriptor);
  }

  return descriptor.message;
};
