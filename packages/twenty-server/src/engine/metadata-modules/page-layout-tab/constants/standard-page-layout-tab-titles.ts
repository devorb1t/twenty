import { msg } from '@lingui/core/macro';

import { rememberStandardMetadataDescriptor } from 'src/engine/core-modules/i18n/standard-metadata-descriptor-registry/remember-standard-metadata-descriptor.util';

// MessageDescriptors (not plain strings) so the Lingui extractor picks them up.
const STANDARD_PAGE_LAYOUT_TAB_TITLE_DESCRIPTORS = [
  msg`Home`,
  msg`Timeline`,
  msg`Tasks`,
  msg`Notes`,
  msg`Files`,
  msg`Emails`,
  msg`Calendar`,
  msg`Note`,
  msg`Flow`,
];

for (const descriptor of STANDARD_PAGE_LAYOUT_TAB_TITLE_DESCRIPTORS) {
  rememberStandardMetadataDescriptor(descriptor);
}
