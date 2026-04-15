import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { type FieldConfiguration } from '@/page-layout/types/FieldConfiguration';
import { filterFieldsForRecordTableViewCreation } from '@/page-layout/widgets/record-table/utils/filterFieldsForRecordTableViewCreation';
import { sortFieldsByRelevanceForRecordTableWidget } from '@/page-layout/widgets/record-table/utils/sortFieldsByRelevanceForRecordTableWidget';
import { usePerformViewAPIPersist } from '@/views/hooks/internal/usePerformViewAPIPersist';
import { usePerformViewFieldAPIPersist } from '@/views/hooks/internal/usePerformViewFieldAPIPersist';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  FieldDisplayMode,
  ViewType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { v4 } from 'uuid';

const DEFAULT_VIEW_FIELD_SIZE = 180;
const INITIAL_VISIBLE_FIELDS_COUNT_IN_WIDGET = 6;

const resolveRelatedObject = (
  objectMetadataItems: EnrichedObjectMetadataItem[],
  parentObjectMetadataId: string,
  fieldMetadataId: string,
):
  | { field: FieldMetadataItem; relatedObject: EnrichedObjectMetadataItem }
  | undefined => {
  const parentObject = objectMetadataItems.find(
    (item) => item.id === parentObjectMetadataId,
  );

  if (!isDefined(parentObject)) {
    return undefined;
  }

  const field = parentObject.fields.find((f) => f.id === fieldMetadataId);
  const relatedObjectId = field?.relation?.targetObjectMetadata.id;

  if (!isDefined(field) || !isDefined(relatedObjectId)) {
    return undefined;
  }

  const relatedObject = objectMetadataItems.find(
    (item) => item.id === relatedObjectId,
  );

  if (!isDefined(relatedObject)) {
    return undefined;
  }

  return { field, relatedObject };
};

export const useCreatePendingFieldWidgetTableViews = () => {
  const { performViewAPICreate } = usePerformViewAPIPersist();
  const { performViewFieldAPICreate } = usePerformViewFieldAPIPersist();
  const store = useStore();

  const createPendingFieldWidgetTableViews = useCallback(
    async (pageLayoutId: string) => {
      const draft = store.get(
        pageLayoutDraftComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
      );
      const persisted = store.get(
        pageLayoutPersistedComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
      );

      const persistedViewIdsByWidgetId = new Map<string, string | null>();
      persisted?.tabs.forEach((tab) =>
        tab.widgets.forEach((widget) => {
          if (widget.configuration.configurationType === 'FIELD') {
            const config = widget.configuration as FieldConfiguration;
            persistedViewIdsByWidgetId.set(widget.id, config.viewId ?? null);
          }
        }),
      );

      const objectMetadataItems = store.get(objectMetadataItemsSelector.atom);

      const pendingWidgets = draft.tabs
        .flatMap((tab) => tab.widgets)
        .filter((widget) => {
          if (widget.type !== WidgetType.FIELD) {
            return false;
          }

          const config = widget.configuration as FieldConfiguration;

          if (config.fieldDisplayMode !== FieldDisplayMode.VIEW) {
            return false;
          }

          if (!isDefined(config.viewId)) {
            return false;
          }

          // Already persisted with the same viewId → view already exists.
          return persistedViewIdsByWidgetId.get(widget.id) !== config.viewId;
        });

      for (const widget of pendingWidgets) {
        const config = widget.configuration as FieldConfiguration;
        const viewId = config.viewId;

        if (!isDefined(viewId)) {
          continue;
        }

        const parentObjectMetadataId =
          widget.objectMetadataId ?? draft.objectMetadataId;

        if (!isDefined(parentObjectMetadataId)) {
          continue;
        }

        const resolved = resolveRelatedObject(
          objectMetadataItems,
          parentObjectMetadataId,
          config.fieldMetadataId,
        );

        if (!isDefined(resolved)) {
          continue;
        }

        const { relatedObject } = resolved;

        const viewResult = await performViewAPICreate(
          {
            input: {
              id: viewId,
              name: `${relatedObject.labelPlural} Table`,
              icon: relatedObject.icon ?? 'IconTable',
              objectMetadataId: relatedObject.id,
              type: ViewType.TABLE_WIDGET,
            },
          },
          relatedObject.id,
        );

        if (viewResult.status === 'failed') {
          throw new Error(
            `Failed to create view for FIELD table widget ${widget.id}`,
          );
        }

        const eligibleFields = relatedObject.fields.filter(
          filterFieldsForRecordTableViewCreation,
        );

        const sortedFields = eligibleFields.toSorted(
          sortFieldsByRelevanceForRecordTableWidget(
            relatedObject.labelIdentifierFieldMetadataId,
          ),
        );

        const viewFieldInputs = sortedFields.map((field, index) => ({
          id: v4(),
          viewId,
          fieldMetadataId: field.id,
          position: index,
          size: DEFAULT_VIEW_FIELD_SIZE,
          isVisible: index < INITIAL_VISIBLE_FIELDS_COUNT_IN_WIDGET,
        }));

        await performViewFieldAPICreate({ inputs: viewFieldInputs });
      }
    },
    [performViewAPICreate, performViewFieldAPICreate, store],
  );

  return { createPendingFieldWidgetTableViews };
};
