import { type MessageDescriptor } from '@lingui/core';

import { rememberStandardMetadataDescriptor } from 'src/engine/core-modules/i18n/standard-metadata-descriptor-registry/remember-standard-metadata-descriptor.util';

export const i18nLabel = (descriptor: MessageDescriptor): string => {
  rememberStandardMetadataDescriptor(descriptor);

  return descriptor.message ?? '';
};
