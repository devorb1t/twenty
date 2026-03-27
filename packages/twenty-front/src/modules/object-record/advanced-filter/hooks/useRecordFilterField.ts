import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { isValidSubFieldName } from '@/settings/data-model/utils/isValidSubFieldName';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

const useMorphRelationFieldMetadataItem = (fieldMetadataId: string) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  for (const objectMetadataItem of objectMetadataItems) {
    for (const field of objectMetadataItem.fields) {
      if (!isDefined(field.morphRelations)) {
        continue;
      }

      const morphRelation = field.morphRelations.find(
        (relation) => relation.sourceFieldMetadata.id === fieldMetadataId,
      );

      if (isDefined(morphRelation)) {
        const targetObjectMetadata = objectMetadataItems.find(
          (item) => item.id === morphRelation.targetObjectMetadata.id,
        );

        return {
          fieldMetadataItem: {
            ...field,
            icon: targetObjectMetadata?.icon ?? field.icon,
            relation: morphRelation,
          },
          morphRelation,
        };
      }
    }
  }

  return { fieldMetadataItem: undefined, morphRelation: undefined };
};

export const useRecordFilterField = (recordFilterId: string) => {
  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );

  const recordFilter = currentRecordFilters.find(
    (recordFilter) => recordFilter.id === recordFilterId,
  );

  const { fieldMetadataItem: directFieldMetadataItem } =
    useFieldMetadataItemById(recordFilter?.fieldMetadataId ?? '');

  const { fieldMetadataItem: morphFieldMetadataItem } =
    useMorphRelationFieldMetadataItem(recordFilter?.fieldMetadataId ?? '');

  const fieldMetadataItem = directFieldMetadataItem ?? morphFieldMetadataItem;

  const { getIcon } = useIcons();

  const icon = isDefined(fieldMetadataItem?.icon)
    ? getIcon(fieldMetadataItem?.icon)
    : undefined;

  const subFieldLabel =
    isDefined(fieldMetadataItem) &&
    isCompositeFieldType(fieldMetadataItem.type) &&
    isNonEmptyString(recordFilter?.subFieldName) &&
    isValidSubFieldName(recordFilter.subFieldName)
      ? getCompositeSubFieldLabel(
          fieldMetadataItem.type,
          recordFilter.subFieldName,
        )
      : '';

  const label = isNonEmptyString(subFieldLabel)
    ? `${recordFilter?.label} / ${subFieldLabel}`
    : (recordFilter?.label ?? '');

  return {
    label,
    icon,
  };
};
