import { styled } from '@linaria/react';
import { Suspense, lazy } from 'react';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';

const FrontComponentRenderer = lazy(() =>
  import('@/front-components/components/FrontComponentRenderer').then(
    (module) => ({ default: module.FrontComponentRenderer }),
  ),
);

const StyledContainer = styled.div`
  height: 100%;
  overflow: auto;
  width: 100%;
`;

type SettingsApplicationCustomTabProps = {
  settingsCustomTabFrontComponentId: string;
};

export const SettingsApplicationCustomTab = ({
  settingsCustomTabFrontComponentId,
}: SettingsApplicationCustomTabProps) => {
  return (
    <StyledContainer>
      <Suspense fallback={null}>
        <FrontComponentRenderer
          frontComponentId={settingsCustomTabFrontComponentId}
          contextStoreInstanceId={MAIN_CONTEXT_STORE_INSTANCE_ID}
        />
      </Suspense>
    </StyledContainer>
  );
};
