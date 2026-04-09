import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ActiveNavigationItem } from '@/navigation-menu-item/common/types/ActiveNavigationItem';
import { matchesRecordShowPathForObject } from '@/navigation-menu-item/common/utils/matchesRecordShowPathForObject';
import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/display/object/utils/getObjectMetadataForNavigationMenuItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type View } from '@/views/types/View';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type ShouldShowOpenedSectionParams = {
  objectMetadataItem: EnrichedObjectMetadataItem | undefined;
  pathname: string;
  activeNavigationItem: ActiveNavigationItem | null;
  workspaceNavigationMenuItems: NavigationMenuItem[];
  objectMetadataItems: EnrichedObjectMetadataItem[];
  views: Pick<View, 'id' | 'objectMetadataId'>[];
};

export const shouldShowOpenedSection = ({
  objectMetadataItem,
  pathname,
  activeNavigationItem,
  workspaceNavigationMenuItems,
  objectMetadataItems,
  views,
}: ShouldShowOpenedSectionParams): boolean => {
  if (!isDefined(objectMetadataItem)) {
    return false;
  }

  if (
    !matchesRecordShowPathForObject(pathname, objectMetadataItem.nameSingular)
  ) {
    return false;
  }

  const hasTopLevelObjectWorkspaceItem = workspaceNavigationMenuItems.some(
    (item) => {
      if (item.type !== NavigationMenuItemType.OBJECT) {
        return false;
      }
      const metadata = getObjectMetadataForNavigationMenuItem(
        item,
        objectMetadataItems,
        views,
      );
      return isDefined(metadata) && metadata.id === objectMetadataItem.id;
    },
  );

  if (hasTopLevelObjectWorkspaceItem) {
    return false;
  }

  if (!isDefined(activeNavigationItem)) {
    return true;
  }

  if (
    activeNavigationItem.objectNameSingular !== objectMetadataItem.nameSingular
  ) {
    return true;
  }

  const activeWorkspaceNavigationMenuItem = workspaceNavigationMenuItems.find(
    (item) => item.id === activeNavigationItem.navItemId,
  );

  if (!isDefined(activeWorkspaceNavigationMenuItem)) {
    return true;
  }

  const isViewOrRecord =
    activeWorkspaceNavigationMenuItem.type === NavigationMenuItemType.VIEW ||
    activeWorkspaceNavigationMenuItem.type === NavigationMenuItemType.RECORD;

  if (!isViewOrRecord) {
    return true;
  }

  const objectMetadataForActiveItem = getObjectMetadataForNavigationMenuItem(
    activeWorkspaceNavigationMenuItem,
    objectMetadataItems,
    views,
  );

  const targetsCurrentObject =
    isDefined(objectMetadataForActiveItem) &&
    objectMetadataForActiveItem.id === objectMetadataItem.id;

  return !targetsCurrentObject;
};
