import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { IconPlus, IconTool } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useNavigationMenuEditModeActions } from '@/navigation-menu-item/hooks/useNavigationMenuEditModeActions';
import { useOpenNavigationMenuItemInCommandMenu } from '@/navigation-menu-item/hooks/useOpenNavigationMenuItemInCommandMenu';
import { useWorkspaceNavigationMenuItems } from '@/navigation-menu-item/hooks/useWorkspaceNavigationMenuItems';
import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/states/isNavigationMenuInEditModeState';
import { selectedWorkspaceObjectMetadataItemIdInEditModeState } from '@/navigation-menu-item/states/selectedWorkspaceObjectMetadataItemIdInEditModeState';
import { NavigationDrawerSectionForObjectMetadataItems } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItems';
import { NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

const StyledRightIconsContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const WorkspaceNavigationMenuItems = () => {
  const { workspaceNavigationMenuItemsObjectMetadataItems } =
    useWorkspaceNavigationMenuItems();
  const { enterEditMode } = useNavigationMenuEditModeActions();
  const isNavigationMenuItemEditingEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_EDITING_ENABLED,
  );
  const isNavigationMenuInEditMode = useRecoilValue(
    isNavigationMenuInEditModeState,
  );
  const [
    selectedWorkspaceObjectMetadataItemIdInEditMode,
    setSelectedWorkspaceObjectMetadataItemIdInEditMode,
  ] = useRecoilState(selectedWorkspaceObjectMetadataItemIdInEditModeState);
  const { navigateCommandMenu } = useNavigateCommandMenu();
  const { openNavigationMenuItemInCommandMenu } =
    useOpenNavigationMenuItemInCommandMenu();

  const loading = useIsPrefetchLoading();
  const { t } = useLingui();

  const handleEditClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    enterEditMode();
  };

  const handleObjectMetadataItemClick = useCallback(
    (objectMetadataItem: ObjectMetadataItem) => {
      setSelectedWorkspaceObjectMetadataItemIdInEditMode(objectMetadataItem.id);
      openNavigationMenuItemInCommandMenu({ objectMetadataItem });
    },
    [
      setSelectedWorkspaceObjectMetadataItemIdInEditMode,
      openNavigationMenuItemInCommandMenu,
    ],
  );

  const handleActiveObjectMetadataItemClick = (
    objectMetadataItem: ObjectMetadataItem,
  ) => {
    enterEditMode();
    setSelectedWorkspaceObjectMetadataItemIdInEditMode(objectMetadataItem.id);
    openNavigationMenuItemInCommandMenu({ objectMetadataItem });
  };

  const isEditMode =
    isNavigationMenuItemEditingEnabled && isNavigationMenuInEditMode;

  if (loading) {
    return <NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader />;
  }

  return (
    <NavigationDrawerSectionForObjectMetadataItems
      sectionTitle={t`Workspace`}
      objectMetadataItems={workspaceNavigationMenuItemsObjectMetadataItems}
      isRemote={false}
      rightIcon={
        isNavigationMenuItemEditingEnabled ? (
          <StyledRightIconsContainer>
            {isEditMode ? (
              <LightIconButton
                Icon={IconPlus}
                accent="tertiary"
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  navigateCommandMenu({
                    page: CommandMenuPages.NavigationMenuAddItem,
                    pageTitle: t`New sidebar item`,
                    pageIcon: IconPlus,
                    resetNavigationStack: true,
                  });
                }}
              />
            ) : (
              <LightIconButton
                Icon={IconTool}
                accent="tertiary"
                size="small"
                onClick={handleEditClick}
              />
            )}
          </StyledRightIconsContainer>
        ) : undefined
      }
      isEditMode={isEditMode}
      selectedObjectMetadataItemId={
        selectedWorkspaceObjectMetadataItemIdInEditMode
      }
      onObjectMetadataItemClick={
        isEditMode ? handleObjectMetadataItemClick : undefined
      }
      onActiveObjectMetadataItemClick={
        isNavigationMenuItemEditingEnabled
          ? handleActiveObjectMetadataItemClick
          : undefined
      }
    />
  );
};
