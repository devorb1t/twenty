import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isValidUrl } from 'twenty-shared/utils';

import { type FieldLinksValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldLinksValue } from '@/object-record/record-field/ui/types/guards/isFieldLinksValue';

export const getFieldLinkDefinedLinks = (fieldValue: FieldLinksValue) => {
  if (!isFieldLinksValue(fieldValue)) {
    return [];
  }

  return [
    isNonEmptyString(fieldValue.primaryLinkUrl)
      ? {
          url: fieldValue.primaryLinkUrl,
          label: fieldValue.primaryLinkLabel,
        }
      : null,
    ...(fieldValue.secondaryLinks ?? []),
  ]
    .filter(isDefined)
    .map((link) => {
      if (!isNonEmptyString(link.url)) {
        return undefined;
      }

      return {
        url: link.url,
        label: link.label,
      };
    })
    .filter(isDefined)
    .filter(({ url }) => isValidUrl(url));
};
