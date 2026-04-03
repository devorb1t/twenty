import { isNonEmptyString } from '@sniptt/guards';

import { AppPath, NavigationMenuItemType } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

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
    const recordShowBase = getAppPath(AppPath.RecordShowPage, {
      objectNameSingular: objectNameSingularForRecordShowMatch,
      objectRecordId: '',
    });

    return currentPath.startsWith(`${recordShowBase}/`);
  }

  return false;
};
