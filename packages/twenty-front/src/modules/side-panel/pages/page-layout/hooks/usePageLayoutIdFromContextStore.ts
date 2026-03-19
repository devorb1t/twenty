import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { currentPageLayoutIdState } from '@/page-layout/states/currentPageLayoutIdState';
import { recordPageLayoutByObjectMetadataIdFamilySelector } from '@/page-layout/states/selectors/recordPageLayoutByObjectMetadataIdFamilySelector';
import { getDefaultRecordPageLayoutId } from '@/page-layout/utils/getDefaultRecordPageLayoutId';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const usePageLayoutIdFromContextStore = () => {
  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const hasSingleRecordSelected =
    contextStoreTargetedRecordsRule.mode === 'selection' &&
    contextStoreTargetedRecordsRule.selectedRecordIds.length === 1;

  const recordId = hasSingleRecordSelected
    ? contextStoreTargetedRecordsRule.selectedRecordIds[0]
    : undefined;

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const objectMetadataItem = isDefined(contextStoreCurrentObjectMetadataItemId)
    ? objectMetadataItems.find(
        (item) => item.id === contextStoreCurrentObjectMetadataItemId,
      )
    : undefined;

  const isDashboardContext =
    isDefined(objectMetadataItem) &&
    objectMetadataItem.nameSingular === CoreObjectNameSingular.Dashboard;

  const recordStore = useAtomFamilyStateValue(
    recordStoreFamilyState,
    recordId ?? '',
  );
  const currentPageLayoutId = useAtomStateValue(currentPageLayoutIdState);

  const recordPageLayout = useAtomFamilySelectorValue(
    recordPageLayoutByObjectMetadataIdFamilySelector,
    {
      objectMetadataId: isDefined(objectMetadataItem)
        ? objectMetadataItem.id
        : '',
    },
  );

  if (!isDefined(objectMetadataItem) || !isDefined(recordId)) {
    return {
      pageLayoutId: undefined,
      recordId: undefined,
      objectNameSingular: undefined,
    };
  }

  const pageLayoutId = isDashboardContext
    ? (recordStore?.pageLayoutId ?? currentPageLayoutId)
    : isDefined(recordPageLayout)
      ? recordPageLayout.id
      : getDefaultRecordPageLayoutId({
          targetObjectNameSingular: objectMetadataItem.nameSingular,
        });

  return {
    pageLayoutId,
    recordId,
    objectNameSingular: objectMetadataItem.nameSingular,
  };
};
