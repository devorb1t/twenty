import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { IconCheck, useIcons } from 'twenty-ui/display';

import { useNavigationMenuEditModeActions } from '@/navigation-menu-item/hooks/useNavigationMenuEditModeActions';
import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/hooks/useNavigationMenuItemsDraftState';
import { useSaveNavigationMenuItemsDraft } from '@/navigation-menu-item/hooks/useSaveNavigationMenuItemsDraft';
import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/states/isNavigationMenuInEditModeState';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
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
  const [isSaving, setIsSaving] = useState(false);
  const { enqueueErrorSnackBar } = useSnackBar();
  const { cancelEditMode } = useNavigationMenuEditModeActions();
  const { saveDraft } = useSaveNavigationMenuItemsDraft();
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

  const handleSave = async () => {
    if (!isDirty) return;

    setIsSaving(true);
    try {
      await saveDraft();
      cancelEditMode();
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to save navigation layout`,
      });
    } finally {
      setIsSaving(false);
    }
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
        isSaveDisabled={!isDirty || isSaving}
        isLoading={isSaving}
        inverted
        saveIcon={IconCheck}
      />
    </StyledContainer>
  );
};
