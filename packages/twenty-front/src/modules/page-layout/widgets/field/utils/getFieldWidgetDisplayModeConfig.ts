import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { FieldDisplayMode } from '~/generated-metadata/graphql';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  FIELD_WIDGET_CONFIG,
  type FieldWidgetFieldTypeConfig,
} from '@/page-layout/widgets/field/constants/fieldWidgetConfig';

type FieldMetadataItemLike = Pick<FieldMetadataItem, 'type' | 'settings'>;

const isOneToManyRelation = (fieldMetadataItem: FieldMetadataItemLike) =>
  fieldMetadataItem.type === FieldMetadataType.RELATION &&
  fieldMetadataItem.settings?.relationType === RelationType.ONE_TO_MANY;

export const getFieldWidgetConfig = (fieldType: FieldMetadataType) =>
  FIELD_WIDGET_CONFIG[fieldType];

export const getFieldWidgetConfigForField = (
  fieldMetadataItem: FieldMetadataItemLike,
): FieldWidgetFieldTypeConfig | undefined => {
  const baseConfig = FIELD_WIDGET_CONFIG[fieldMetadataItem.type];

  if (baseConfig === undefined) {
    return undefined;
  }

  if (isOneToManyRelation(fieldMetadataItem)) {
    return {
      ...baseConfig,
      availableDisplayModes: [
        ...baseConfig.availableDisplayModes,
        FieldDisplayMode.VIEW,
      ],
    };
  }

  return baseConfig;
};

export const getFieldWidgetDefaultDisplayMode = (
  fieldType: FieldMetadataType,
) =>
  getFieldWidgetConfig(fieldType)?.defaultDisplayMode ?? FieldDisplayMode.FIELD;

export const getFieldWidgetAvailableDisplayModes = (
  fieldType: FieldMetadataType,
) =>
  getFieldWidgetConfig(fieldType)?.availableDisplayModes ?? [
    FieldDisplayMode.FIELD,
  ];

export const getFieldWidgetAvailableDisplayModesForField = (
  fieldMetadataItem: FieldMetadataItemLike,
) =>
  getFieldWidgetConfigForField(fieldMetadataItem)?.availableDisplayModes ?? [
    FieldDisplayMode.FIELD,
  ];

export const isDisplayModeValidForFieldType = (
  fieldType: FieldMetadataType,
  displayMode: FieldDisplayMode,
) => getFieldWidgetAvailableDisplayModes(fieldType).includes(displayMode);

export const isDisplayModeValidForField = (
  fieldMetadataItem: FieldMetadataItemLike,
  displayMode: FieldDisplayMode,
) =>
  getFieldWidgetAvailableDisplayModesForField(fieldMetadataItem).includes(
    displayMode,
  );
