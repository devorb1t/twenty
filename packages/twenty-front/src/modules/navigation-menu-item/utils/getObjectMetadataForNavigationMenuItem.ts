import { isDefined } from 'twenty-shared/utils';

import { isNavigationMenuItemLink } from '@/navigation-menu-item/utils/isNavigationMenuItemLink';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type View } from '@/views/types/View';

export const getObjectMetadataForNavigationMenuItem = (
  navigationMenuItem: ProcessedNavigationMenuItem,
  objectMetadataItems: ObjectMetadataItem[],
  views: View[],
): ObjectMetadataItem | null => {
  if (isNavigationMenuItemLink(navigationMenuItem)) {
    return null;
  }

  if (isDefined(navigationMenuItem.viewId)) {
    const view = views.find((view) => view.id === navigationMenuItem.viewId);
    if (!isDefined(view)) {
      return null;
    }
    const objectMetadataItem = objectMetadataItems.find(
      (meta) => meta.id === view.objectMetadataId,
    );
    return objectMetadataItem ?? null;
  }

  if (isDefined(navigationMenuItem.targetObjectMetadataId)) {
    const objectMetadataItem = objectMetadataItems.find(
      (meta) => meta.id === navigationMenuItem.targetObjectMetadataId,
    );
    return objectMetadataItem ?? null;
  }

  return null;
};
