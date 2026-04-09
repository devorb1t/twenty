import { AppPath, NavigationMenuItemType } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

import { type ActiveNavigationItem } from '@/navigation-menu-item/common/types/ActiveNavigationItem';
import { isLocationMatchingNavigationMenuItem } from '@/navigation-menu-item/common/utils/isLocationMatchingNavigationMenuItem';
import { matchesRecordShowPathForObject } from '@/navigation-menu-item/common/utils/matchesRecordShowPathForObject';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type IsNavigationItemActiveParams = {
  navigationMenuItem: Pick<NavigationMenuItem, 'id' | 'type'> | undefined;
  activeNavigationItem: ActiveNavigationItem | null;
  objectNameSingular: string;
  objectNamePlural: string;
  computedLink: string;
  currentLocation: { pathname: string; search: string };
};

export const isNavigationItemActive = ({
  navigationMenuItem,
  activeNavigationItem,
  objectNameSingular,
  objectNamePlural,
  computedLink,
  currentLocation,
}: IsNavigationItemActiveParams): boolean => {
  const currentPath = currentLocation.pathname;
  const currentPathWithSearch = `${currentLocation.pathname}${currentLocation.search}`;

  const navigationMenuItemType = navigationMenuItem?.type;
  const isRecord = navigationMenuItemType === NavigationMenuItemType.RECORD;
  const isObject = navigationMenuItemType === NavigationMenuItemType.OBJECT;
  const hasCustomLink =
    isRecord ||
    isObject ||
    navigationMenuItemType === NavigationMenuItemType.VIEW;

  const isOnObjectRecordShowPage = matchesRecordShowPathForObject(
    currentPath,
    objectNameSingular,
  );

  const isOnObjectIndexPage =
    currentPath === getAppPath(AppPath.RecordIndexPage, { objectNamePlural });

  const isCurrentPathMatchingObject =
    isOnObjectIndexPage || isOnObjectRecordShowPage;

  const matchesNavigationMenuItemLink =
    hasCustomLink &&
    isDefined(navigationMenuItemType) &&
    isLocationMatchingNavigationMenuItem(
      currentPath,
      currentPathWithSearch,
      navigationMenuItemType,
      computedLink,
    );

  const isActiveByUrl =
    matchesNavigationMenuItemLink ||
    (isObject && isOnObjectRecordShowPage) ||
    (!hasCustomLink && isCurrentPathMatchingObject);

  const shouldUseExplicitActiveItem =
    isDefined(activeNavigationItem) &&
    activeNavigationItem.objectNameSingular === objectNameSingular &&
    isCurrentPathMatchingObject;

  if (!shouldUseExplicitActiveItem || !isDefined(navigationMenuItem)) {
    return isActiveByUrl;
  }

  const isRecordMatchingCurrentPage = isRecord && computedLink === currentPath;

  return (
    activeNavigationItem.navItemId === navigationMenuItem.id ||
    isRecordMatchingCurrentPage
  );
};
