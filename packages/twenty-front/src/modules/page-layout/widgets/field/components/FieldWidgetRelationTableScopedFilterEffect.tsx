import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { lastLoadedRecordTableWidgetViewIdComponentState } from '@/object-record/record-table-widget/states/lastLoadedRecordTableWidgetViewIdComponentState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useEffect } from 'react';
import { ViewFilterOperand } from '~/generated-metadata/graphql';

type FieldWidgetRelationTableScopedFilterEffectProps = {
  viewId: string;
  widgetId: string;
  inverseRelationFieldMetadataId: string;
  targetRecordId: string;
};

export const FieldWidgetRelationTableScopedFilterEffect = ({
  viewId,
  widgetId,
  inverseRelationFieldMetadataId,
  targetRecordId,
}: FieldWidgetRelationTableScopedFilterEffectProps) => {
  const lastLoadedViewId = useAtomComponentStateValue(
    lastLoadedRecordTableWidgetViewIdComponentState,
  );

  const [, setCurrentRecordFilters] = useAtomComponentState(
    currentRecordFiltersComponentState,
  );

  useEffect(() => {
    if (lastLoadedViewId?.viewId !== viewId) {
      return;
    }

    const scopedFilter: RecordFilter = {
      id: `field-widget-relation-scope-${widgetId}`,
      fieldMetadataId: inverseRelationFieldMetadataId,
      value: JSON.stringify({
        isCurrentWorkspaceMemberSelected: false,
        selectedRecordIds: [targetRecordId],
      }),
      displayValue: '',
      label: '',
      type: 'RELATION',
      operand: ViewFilterOperand.IS,
    };

    setCurrentRecordFilters([scopedFilter]);
  }, [
    lastLoadedViewId,
    viewId,
    widgetId,
    inverseRelationFieldMetadataId,
    targetRecordId,
    setCurrentRecordFilters,
  ]);

  return null;
};
