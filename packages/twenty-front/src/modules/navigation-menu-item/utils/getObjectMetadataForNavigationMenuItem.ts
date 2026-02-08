import { isDefined } from 'twenty-shared/utils';

import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type View } from '@/views/types/View';

export const getObjectMetadataForNavigationMenuItem = (
  navigationMenuItem: ProcessedNavigationMenuItem,
  objectMetadataItems: ObjectMetadataItem[],
  views: View[],
): ObjectMetadataItem | null => {
  if (navigationMenuItem.itemType === 'link') {
    return null;
  }

  if (
    navigationMenuItem.itemType === 'view' &&
    isDefined(navigationMenuItem.viewId)
  ) {
    const view = views.find((view) => view.id === navigationMenuItem.viewId);
    if (!isDefined(view)) {
      return null;
    }
    const objectMetadataItem = objectMetadataItems.find(
      (meta) => meta.id === view.objectMetadataId,
    );
    return objectMetadataItem ?? null;
  }

  if (
    navigationMenuItem.itemType === 'record' &&
    isDefined(navigationMenuItem.targetObjectMetadataId)
  ) {
    const objectMetadataItem = objectMetadataItems.find(
      (meta) => meta.id === navigationMenuItem.targetObjectMetadataId,
    );
    return objectMetadataItem ?? null;
  }

  return null;
};
