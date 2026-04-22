import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { type ContextStoreTargetedRecordsRule } from 'twenty-shared/types';

export type { ContextStoreTargetedRecordsRule } from 'twenty-shared/types';

export const contextStoreTargetedRecordsRuleComponentState =
  createAtomComponentState<ContextStoreTargetedRecordsRule>({
    key: 'contextStoreTargetedRecordsRuleComponentState',
    defaultValue: {
      mode: 'selection',
      selectedRecordIds: [],
    },
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });
