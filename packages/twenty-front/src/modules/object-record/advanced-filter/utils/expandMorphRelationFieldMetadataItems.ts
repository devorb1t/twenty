import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

export type ExpandedFilterableField = FieldMetadataItem & {
  morphRelationTarget?: FieldMetadataItemRelation;
};

export const expandMorphRelationFieldMetadataItems = (
  fieldMetadataItems: FieldMetadataItem[],
  objectMetadataItems: EnrichedObjectMetadataItem[],
): ExpandedFilterableField[] => {
  return fieldMetadataItems.flatMap((field) => {
    if (
      field.type !== FieldMetadataType.MORPH_RELATION ||
      !isDefined(field.morphRelations) ||
      field.morphRelations.length === 0
    ) {
      return [field as ExpandedFilterableField];
    }

    return field.morphRelations
      .filter(
        (morphRelation) =>
          morphRelation.type === RelationType.MANY_TO_ONE &&
          isDefined(morphRelation.targetObjectMetadata),
      )
      .map((morphRelation) => {
        const targetObjectMetadata = objectMetadataItems.find(
          (item) => item.id === morphRelation.targetObjectMetadata.id,
        );

        const label =
          targetObjectMetadata?.labelSingular ??
          morphRelation.targetObjectMetadata.nameSingular;

        const icon = targetObjectMetadata?.icon ?? field.icon;

        return {
          ...field,
          id: morphRelation.sourceFieldMetadata.id,
          label,
          icon,
          type: FieldMetadataType.RELATION,
          relation: morphRelation,
          morphRelationTarget: morphRelation,
        } satisfies ExpandedFilterableField;
      });
  });
};
