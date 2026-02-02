import { useLingui } from '@lingui/react/macro';
import { IconTool } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

import { useNavigationMenuEditModeActions } from '@/navigation-menu-item/hooks/useNavigationMenuEditModeActions';
import { useWorkspaceNavigationMenuItems } from '@/navigation-menu-item/hooks/useWorkspaceNavigationMenuItems';
import { NavigationDrawerSectionForObjectMetadataItems } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItems';
import { NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

export const WorkspaceNavigationMenuItems = () => {
  const { workspaceNavigationMenuItemsObjectMetadataItems } =
    useWorkspaceNavigationMenuItems();
  const { enterEditMode } = useNavigationMenuEditModeActions();
  const isNavigationMenuItemEditingEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_EDITING_ENABLED,
  );

  const loading = useIsPrefetchLoading();
  const { t } = useLingui();

  const handleEditClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    enterEditMode();
  };

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
    />
  );
};
