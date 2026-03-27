import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const fieldMetadataItemUsedInDropdownComponentSelector =
  createAtomComponentSelector<FieldMetadataItem | null | undefined>({
    key: 'fieldMetadataItemUsedInDropdownComponentSelector',
    componentInstanceContext: ObjectFilterDropdownComponentInstanceContext,
    get:
      (componentStateKey) =>
      ({ get }) => {
        const fieldMetadataItemIdUsedInDropdown = get(
          fieldMetadataItemIdUsedInDropdownComponentState,
          componentStateKey,
        );

        const objectMetadataItems = get(objectMetadataItemsSelector);

        const allFields = objectMetadataItems.flatMap(
          (objectMetadataItem) => objectMetadataItem.fields,
        );

        const correspondingFieldMetadataItem = allFields.find(
          (fieldMetadataItem) =>
            fieldMetadataItem.id === fieldMetadataItemIdUsedInDropdown,
        );

        if (isDefined(correspondingFieldMetadataItem)) {
          return correspondingFieldMetadataItem;
        }

        // Morph relation targets have IDs from morphRelations[].sourceFieldMetadata.id
        // which don't exist as standalone fields — return a virtual RELATION field
        for (const field of allFields) {
          if (!isDefined(field.morphRelations)) {
            continue;
          }

          const morphRelation = field.morphRelations.find(
            (relation) =>
              relation.sourceFieldMetadata.id ===
              fieldMetadataItemIdUsedInDropdown,
          );

          if (isDefined(morphRelation)) {
            return {
              ...field,
              type: FieldMetadataType.RELATION,
              relation: morphRelation,
            };
          }
        }

        return undefined;
      },
  });
