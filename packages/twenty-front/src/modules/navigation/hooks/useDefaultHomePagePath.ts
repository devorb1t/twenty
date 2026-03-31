import { isNonEmptyString } from '@sniptt/guards';
import { useMemo } from 'react';
import {
  AppPath,
  NavigationMenuItemType,
  SettingsPath,
} from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

import { currentUserState } from '@/auth/states/currentUserState';
import { isMinimalMetadataReadyState } from '@/metadata-store/states/isMinimalMetadataReadyState';
import { navigationMenuItemsSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsSelector';
import { filterAndSortNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterAndSortNavigationMenuItems';
import { filterWorkspaceNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterWorkspaceNavigationMenuItems';
import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/display/object/utils/getObjectMetadataForNavigationMenuItem';
import { getNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/utils/getNavigationMenuItemComputedLink';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';

export const useDefaultHomePagePath = () => {
  const currentUser = useAtomStateValue(currentUserState);
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const navigationMenuItems = useAtomStateValue(navigationMenuItemsSelector);
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);
  const isMinimalMetadataReady = useAtomStateValue(isMinimalMetadataReadyState);

  const firstNavigableLink = useMemo(() => {
    const workspaceItems =
      filterWorkspaceNavigationMenuItems(navigationMenuItems);

    const sortedItems = filterAndSortNavigationMenuItems(
      workspaceItems,
      views,
      objectMetadataItems,
    );

    for (const item of sortedItems) {
      if (
        item.type !== NavigationMenuItemType.OBJECT &&
        item.type !== NavigationMenuItemType.VIEW
      ) {
        continue;
      }

      const objectMetadataItem = getObjectMetadataForNavigationMenuItem(
        item,
        objectMetadataItems,
        views,
      );

      if (
        !isDefined(objectMetadataItem) ||
        !getObjectPermissionsForObject(
          objectPermissionsByObjectMetadataId,
          objectMetadataItem.id,
        ).canReadObjectRecords
      ) {
        continue;
      }

      const link = getNavigationMenuItemComputedLink(
        item,
        objectMetadataItems,
        views,
      );

      if (isNonEmptyString(link)) {
        return link;
      }
    }

    return null;
  }, [
    navigationMenuItems,
    objectMetadataItems,
    objectPermissionsByObjectMetadataId,
    views,
  ]);

  const defaultHomePagePath = useMemo(() => {
    if (!isDefined(currentUser)) {
      return AppPath.SignInUp;
    }

    if (isNonEmptyString(firstNavigableLink)) {
      return firstNavigableLink;
    }

    if (!isMinimalMetadataReady) {
      return undefined;
    }

    return getSettingsPath(SettingsPath.ProfilePage);
  }, [currentUser, firstNavigableLink, isMinimalMetadataReady]);

  return { defaultHomePagePath };
};
