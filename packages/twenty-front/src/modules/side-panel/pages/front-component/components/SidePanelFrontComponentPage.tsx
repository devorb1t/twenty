import { Suspense, lazy } from 'react';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { viewableFrontComponentIdComponentState } from '@/side-panel/pages/front-component/states/viewableFrontComponentIdComponentState';
import { viewableFrontComponentRecordContextComponentState } from '@/side-panel/pages/front-component/states/viewableFrontComponentRecordContextComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

const FrontComponentRenderer = lazy(() =>
  import('@/front-components/components/FrontComponentRenderer').then(
    (module) => ({ default: module.FrontComponentRenderer }),
  ),
);

export const SidePanelFrontComponentPage = () => {
  const viewableFrontComponentId = useAtomComponentStateValue(
    viewableFrontComponentIdComponentState,
  );

  const viewableFrontComponentRecordContext = useAtomComponentStateValue(
    viewableFrontComponentRecordContextComponentState,
  );

  if (!isDefined(viewableFrontComponentId)) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <FrontComponentRenderer
        frontComponentId={viewableFrontComponentId}
        recordId={viewableFrontComponentRecordContext?.recordId}
        contextStoreInstanceId={MAIN_CONTEXT_STORE_INSTANCE_ID}
      />
    </Suspense>
  );
};
