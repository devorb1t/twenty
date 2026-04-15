import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatView } from '@/metadata-store/types/FlatView';
import { type FlatViewField } from '@/metadata-store/types/FlatViewField';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { resolveRelatedObjectForFieldWidget } from '@/page-layout/utils/resolveRelatedObjectForFieldWidget';
import { filterFieldsForRecordTableViewCreation } from '@/page-layout/widgets/record-table/utils/filterFieldsForRecordTableViewCreation';
import { sortFieldsByRelevanceForRecordTableWidget } from '@/page-layout/widgets/record-table/utils/sortFieldsByRelevanceForRecordTableWidget';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import {
  ViewOpenRecordIn,
  ViewType,
  ViewVisibility,
} from '~/generated-metadata/graphql';

const DEFAULT_VIEW_FIELD_SIZE = 180;
const INITIAL_VISIBLE_FIELDS_COUNT_IN_WIDGET = 6;

export const useSeedDraftViewForFieldWidgetTable = () => {
  const store = useStore();

  const seedDraftViewForFieldWidgetTable = useCallback(
    ({
      viewId,
      fieldMetadataId,
      parentObjectMetadataId,
    }: {
      viewId: string;
      fieldMetadataId: string;
      parentObjectMetadataId: string;
    }) => {
      const objectMetadataItems = store.get(objectMetadataItemsSelector.atom);

      const resolved = resolveRelatedObjectForFieldWidget({
        objectMetadataItems,
        parentObjectMetadataId,
        fieldMetadataId,
      });

      if (!isDefined(resolved)) {
        return;
      }

      const { relatedObject } = resolved;

      const viewsEntry = store.get(metadataStoreState.atomFamily('views'));
      const viewsCurrent = viewsEntry.current as FlatView[];

      if (viewsCurrent.some((view) => view.id === viewId)) {
        return;
      }

      const syntheticView: FlatView = {
        id: viewId,
        name: `${relatedObject.labelPlural} Table`,
        icon: relatedObject.icon ?? 'IconTable',
        objectMetadataId: relatedObject.id,
        type: ViewType.TABLE_WIDGET,
        isCompact: false,
        shouldHideEmptyGroups: false,
        position: 0,
        openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
        visibility: ViewVisibility.UNLISTED,
        key: null,
      };

      store.set(metadataStoreState.atomFamily('views'), {
        ...viewsEntry,
        current: [...viewsCurrent, syntheticView],
      });

      const eligibleFields = relatedObject.fields.filter(
        filterFieldsForRecordTableViewCreation,
      );

      const sortedFields = eligibleFields.toSorted(
        sortFieldsByRelevanceForRecordTableWidget(
          relatedObject.labelIdentifierFieldMetadataId,
        ),
      );

      const syntheticViewFields: FlatViewField[] = sortedFields.map(
        (field, index) => ({
          id: v4(),
          viewId,
          fieldMetadataId: field.id,
          position: index,
          size: DEFAULT_VIEW_FIELD_SIZE,
          isVisible: index < INITIAL_VISIBLE_FIELDS_COUNT_IN_WIDGET,
          isActive: true,
        }),
      );

      const viewFieldsEntry = store.get(
        metadataStoreState.atomFamily('viewFields'),
      );
      const viewFieldsCurrent = viewFieldsEntry.current as FlatViewField[];

      store.set(metadataStoreState.atomFamily('viewFields'), {
        ...viewFieldsEntry,
        current: [...viewFieldsCurrent, ...syntheticViewFields],
      });
    },
    [store],
  );

  return { seedDraftViewForFieldWidgetTable };
};
