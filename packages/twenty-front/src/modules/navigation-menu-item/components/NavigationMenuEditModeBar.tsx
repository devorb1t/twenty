import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconCheck, useIcons } from 'twenty-ui/display';

import { useNavigationMenuEditModeActions } from '@/navigation-menu-item/hooks/useNavigationMenuEditModeActions';
import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/hooks/useNavigationMenuItemsDraftState';
import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/states/isNavigationMenuInEditModeState';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useRecoilValue } from 'recoil';
import { FeatureFlagKey } from '~/generated/graphql';

const StyledContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.color.blue};
  box-sizing: border-box;
  color: ${({ theme }) => theme.font.color.inverted};
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2, 3)};
  width: 100%;
`;

const StyledTitle = styled.span`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const NavigationMenuEditModeBar = () => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { cancelEditMode } = useNavigationMenuEditModeActions();
  const { isDirty } = useNavigationMenuItemsDraftState();

  const isNavigationMenuInEditMode = useRecoilValue(
    isNavigationMenuInEditModeState,
  );
  const isNavigationMenuItemEditingEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_EDITING_ENABLED,
  );

  const showNavigationMenuEditModeBar =
    isNavigationMenuItemEditingEnabled && isNavigationMenuInEditMode;

  if (!showNavigationMenuEditModeBar) {
    return null;
  }

  const handleSave = () => {
    // TODO: Phase 5 - persist draft to backend, then cancelEditMode()
    cancelEditMode();
  };

  const PaintIcon = getIcon('IconPaint');

  return (
    <StyledContainer>
      <StyledTitle>
        <PaintIcon size={16} />
        {t`Layout customization`}
      </StyledTitle>
      <SaveAndCancelButtons
        onSave={handleSave}
        onCancel={cancelEditMode}
        isSaveDisabled={!isDirty}
        inverted
        saveIcon={IconCheck}
      />
    </StyledContainer>
  );
};
