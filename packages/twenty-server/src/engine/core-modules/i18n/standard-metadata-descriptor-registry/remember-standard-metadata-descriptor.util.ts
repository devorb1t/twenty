import { type MessageDescriptor } from '@lingui/core';

import { standardMetadataDescriptorByMessage } from 'src/engine/core-modules/i18n/standard-metadata-descriptor-registry/standard-metadata-descriptor-by-message.state';

export const rememberStandardMetadataDescriptor = (
  descriptor: MessageDescriptor,
): void => {
  const message = descriptor.message;

  if (message === undefined || message === '') {
    return;
  }

  standardMetadataDescriptorByMessage.set(message, descriptor);
};
