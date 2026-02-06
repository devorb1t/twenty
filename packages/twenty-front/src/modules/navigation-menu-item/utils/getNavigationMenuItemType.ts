import { isNavigationMenuItemFolder } from '@/navigation-menu-item/utils/isNavigationMenuItemFolder';
import { isNavigationMenuItemLink } from '@/navigation-menu-item/utils/isNavigationMenuItemLink';
import { isDefined } from 'twenty-shared/utils';

export type NavigationMenuItemType =
  | 'folder'
  | 'link'
  | 'objectView'
  | 'recordView';

type NavigationMenuItemLike = {
  name?: string | null;
  link?: string | null;
  folderId?: string | null;
  viewId?: string | null;
  targetRecordId?: string | null;
  targetObjectMetadataId?: string | null;
};

export const getNavigationMenuItemType = (
  item: NavigationMenuItemLike,
): NavigationMenuItemType => {
  if (isNavigationMenuItemFolder(item)) {
    return 'folder';
  }
  if (isNavigationMenuItemLink(item)) {
    return 'link';
  }
  if (isDefined(item.targetRecordId)) {
    return 'recordView';
  }
  return 'objectView';
};
