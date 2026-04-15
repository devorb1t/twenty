import { FieldMetadataType } from 'twenty-shared/types';
import { FieldDisplayMode } from '~/generated-metadata/graphql';

export type FieldWidgetFieldTypeConfig = {
  availableDisplayModes: FieldDisplayMode[];
  defaultDisplayMode: FieldDisplayMode;
};

// Static fallback used when only the field type is known (e.g. when the field
// has not been selected yet). Relation-type-sensitive modes like VIEW are
// resolved at runtime in getFieldWidgetDisplayModeConfig.
export const FIELD_WIDGET_CONFIG: Partial<
  Record<FieldMetadataType, FieldWidgetFieldTypeConfig>
> = {
  [FieldMetadataType.RELATION]: {
    availableDisplayModes: [FieldDisplayMode.FIELD, FieldDisplayMode.CARD],
    defaultDisplayMode: FieldDisplayMode.CARD,
  },
  [FieldMetadataType.MORPH_RELATION]: {
    availableDisplayModes: [FieldDisplayMode.FIELD, FieldDisplayMode.CARD],
    defaultDisplayMode: FieldDisplayMode.CARD,
  },
  [FieldMetadataType.RICH_TEXT]: {
    availableDisplayModes: [FieldDisplayMode.FIELD, FieldDisplayMode.EDITOR],
    defaultDisplayMode: FieldDisplayMode.EDITOR,
  },
};
