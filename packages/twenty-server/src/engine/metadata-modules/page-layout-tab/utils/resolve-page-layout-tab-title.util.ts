import { type I18n } from '@lingui/core';

import { translateStandardMetadataLabel } from 'src/engine/core-modules/i18n/standard-metadata-descriptor-registry/translate-standard-metadata-label.util';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

export const resolvePageLayoutTabTitle = ({
  title,
  applicationId,
  i18nInstance,
}: {
  title: string;
  applicationId: string;
  i18nInstance: I18n;
}): string => {
  if (applicationId !== TWENTY_STANDARD_APPLICATION.universalIdentifier) {
    return title;
  }

  return translateStandardMetadataLabel(i18nInstance, title) ?? title;
};
