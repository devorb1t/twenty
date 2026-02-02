import { useLingui } from '@lingui/react/macro';
import { useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { IconTool } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

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
          <LightIconButton
            Icon={IconTool}
            accent="tertiary"
            size="small"
            onClick={handleEditClick}
          />
        ) : undefined
      }
      isEditMode={isEditMode}
      selectedObjectMetadataItemId={
        selectedWorkspaceObjectMetadataItemIdInEditMode
      }
      onObjectMetadataItemClick={
        isEditMode ? handleObjectMetadataItemClick : undefined
      }
    />
  );
};
