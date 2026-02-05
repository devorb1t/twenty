import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceSectionItem } from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { isNavigationMenuItemLink } from '@/navigation-menu-item/utils/isNavigationMenuItemLink';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type View } from '@/views/types/View';

export const processNavigationMenuItemToWorkspaceSectionItem = (
  navigationMenuItem: ProcessedNavigationMenuItem,
  objectMetadataItems: ObjectMetadataItem[],
  views: View[],
): WorkspaceSectionItem | null => {
  if (isNavigationMenuItemLink(navigationMenuItem)) {
    return {
      type: 'link',
      id: navigationMenuItem.id,
      navigationMenuItem,
    };
  }

  let objectMetadataItem: ObjectMetadataItem | undefined;

  if (isDefined(navigationMenuItem.viewId)) {
    const view = views.find((view) => view.id === navigationMenuItem.viewId);
    if (!isDefined(view)) {
      return null;
    }
    objectMetadataItem = objectMetadataItems.find(
      (meta) => meta.id === view.objectMetadataId,
    );
  } else if (isDefined(navigationMenuItem.targetObjectMetadataId)) {
    objectMetadataItem = objectMetadataItems.find(
      (meta) => meta.id === navigationMenuItem.targetObjectMetadataId,
    );
  }

  if (!isDefined(objectMetadataItem)) {
    return null;
  }

  return {
    type: 'objectView',
    id: navigationMenuItem.id,
    navigationMenuItem,
    objectMetadataItem,
  };
};
