import { type I18n } from '@lingui/core';
import { isNonEmptyString } from '@sniptt/guards';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { translateStandardMetadataLabel } from 'src/engine/core-modules/i18n/standard-metadata-descriptor-registry/translate-standard-metadata-label.util';
import { type ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';

export const resolveObjectMetadataStandardOverride = (
  objectMetadata: Pick<
    ObjectMetadataDTO,
    | 'color'
    | 'labelPlural'
    | 'labelSingular'
    | 'description'
    | 'icon'
    | 'isCustom'
    | 'standardOverrides'
  >,
  labelKey: 'color' | 'labelPlural' | 'labelSingular' | 'description' | 'icon',
  locale: keyof typeof APP_LOCALES | undefined,
  i18nInstance: I18n,
): string => {
  const safeLocale = locale ?? SOURCE_LOCALE;
  const baseValue = objectMetadata[labelKey] ?? '';

  if (objectMetadata.isCustom) {
    return baseValue;
  }

  if (labelKey === 'icon' || labelKey === 'color') {
    return objectMetadata.standardOverrides?.[labelKey] ?? baseValue;
  }

  const translationOverride =
    objectMetadata.standardOverrides?.translations?.[safeLocale]?.[labelKey];

  if (isDefined(translationOverride)) {
    return translationOverride;
  }

  if (isNonEmptyString(objectMetadata.standardOverrides?.[labelKey])) {
    return objectMetadata.standardOverrides[labelKey] ?? '';
  }

  return translateStandardMetadataLabel(i18nInstance, baseValue) ?? baseValue;
};
