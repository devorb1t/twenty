import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { type RecordShowParentView } from 'twenty-shared/types';

export type { RecordShowParentView } from 'twenty-shared/types';

export const contextStoreRecordShowParentViewComponentState =
  createAtomComponentState<RecordShowParentView | undefined | null>({
    key: 'contextStoreRecordShowParentViewComponentState',
    defaultValue: undefined,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });
