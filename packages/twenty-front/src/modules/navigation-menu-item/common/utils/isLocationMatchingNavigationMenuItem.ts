import { isNonEmptyString } from '@sniptt/guards';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { matchesRecordShowPathForObject } from '@/navigation-menu-item/common/utils/matchesRecordShowPathForObject';

export const isLocationMatchingNavigationMenuItem = (
  currentPath: string,
  currentViewPath: string,
  navigationMenuItemType: NavigationMenuItemType,
  computedLink: string,
  objectNameSingularForRecordShowMatch: string | null = null,
) => {
  const isViewBasedItem =
    navigationMenuItemType === NavigationMenuItemType.VIEW ||
    navigationMenuItemType === NavigationMenuItemType.OBJECT;

  const matchesListDestination = isViewBasedItem
    ? computedLink === currentViewPath
    : computedLink === currentPath;

  if (matchesListDestination) {
    return true;
  }

  if (
    isViewBasedItem &&
    isNonEmptyString(objectNameSingularForRecordShowMatch)
  ) {
    return matchesRecordShowPathForObject(
      currentPath,
      objectNameSingularForRecordShowMatch,
    );
  }

  return false;
};
