import { type I18n } from '@lingui/core';
import { isNonEmptyString } from '@sniptt/guards';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { translateStandardMetadataLabel } from 'src/engine/core-modules/i18n/standard-metadata-descriptor-registry/translate-standard-metadata-label.util';
import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';

export const resolveFieldMetadataStandardOverride = (
  fieldMetadata: Pick<
    FieldMetadataDTO,
    'label' | 'description' | 'icon' | 'isCustom' | 'standardOverrides'
  >,
  labelKey: 'label' | 'description' | 'icon',
  locale: keyof typeof APP_LOCALES | undefined,
  i18nInstance: I18n,
): string => {
  const baseValue = fieldMetadata[labelKey] ?? '';

  if (fieldMetadata.isCustom) {
    return baseValue;
  }

  if (labelKey === 'icon') {
    return fieldMetadata.standardOverrides?.icon ?? baseValue;
  }

  if (isDefined(locale)) {
    const translationOverride =
      fieldMetadata.standardOverrides?.translations?.[locale]?.[labelKey];

    if (isDefined(translationOverride)) {
      return translationOverride;
    }
  }

  if (
    locale === SOURCE_LOCALE &&
    isNonEmptyString(fieldMetadata.standardOverrides?.[labelKey])
  ) {
    return fieldMetadata.standardOverrides[labelKey] ?? '';
  }

  return translateStandardMetadataLabel(i18nInstance, baseValue) ?? baseValue;
};
