import { useTheme } from '@emotion/react';
import { useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { IconFolder, IconFolderOpen } from 'twenty-ui/display';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';
import { useIsMobile } from 'twenty-ui/utilities';

import { getNavigationMenuItemIconColors } from '@/navigation-menu-item/utils/getNavigationMenuItemIconColors';
import { NavigationMenuItemIcon } from '@/navigation-menu-item/components/NavigationMenuItemIcon';
import { openNavigationMenuItemFolderIdsState } from '@/navigation-menu-item/states/openNavigationMenuItemFolderIdsState';
import { getNavigationMenuItemSecondaryLabel } from '@/navigation-menu-item/utils/getNavigationMenuItemSecondaryLabel';
import { isLocationMatchingNavigationMenuItem } from '@/navigation-menu-item/utils/isLocationMatchingNavigationMenuItem';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerItemsCollapsableContainer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemsCollapsableContainer';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { currentNavigationMenuItemFolderIdState } from '@/ui/navigation/navigation-drawer/states/currentNavigationMenuItemFolderIdState';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';

type WorkspaceNavigationMenuItemsFolderProps = {
  folder: {
    folderId: string;
    folderName: string;
    navigationMenuItems: ProcessedNavigationMenuItem[];
  };
  isGroup: boolean;
};

export const WorkspaceNavigationMenuItemsFolder = ({
  folder,
  isGroup,
}: WorkspaceNavigationMenuItemsFolderProps) => {
  const theme = useTheme();
  const iconColors = getNavigationMenuItemIconColors(theme);
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const currentPath = useLocation().pathname;
  const currentViewPath = useLocation().pathname + useLocation().search;
  const isMobile = useIsMobile();

  const [openNavigationMenuItemFolderIds, setOpenNavigationMenuItemFolderIds] =
    useRecoilState(openNavigationMenuItemFolderIdsState);

  const setCurrentFolderId = useSetRecoilState(
    currentNavigationMenuItemFolderIdState,
  );

  const isOpen = openNavigationMenuItemFolderIds.includes(folder.folderId);

  const handleToggle = () => {
    if (isMobile) {
      setCurrentFolderId((prev) =>
        prev === folder.folderId ? null : folder.folderId,
      );
    } else {
      setOpenNavigationMenuItemFolderIds((currentOpenFolders) => {
        if (isOpen) {
          return currentOpenFolders.filter((id) => id !== folder.folderId);
        } else {
          return [...currentOpenFolders, folder.folderId];
        }
      });
    }
  };

  const selectedNavigationMenuItemIndex = folder.navigationMenuItems.findIndex(
    (item) =>
      isLocationMatchingNavigationMenuItem(currentPath, currentViewPath, item),
  );

  const navigationMenuItemFolderContentLength =
    folder.navigationMenuItems.length;

  return (
    <NavigationDrawerItemsCollapsableContainer
      key={folder.folderId}
      isGroup={isGroup}
    >
      <NavigationDrawerItem
        label={folder.folderName}
        Icon={isOpen ? IconFolderOpen : IconFolder}
        iconBackgroundColor={iconColors.folder}
        onClick={handleToggle}
        className="navigation-drawer-item"
        triggerEvent="CLICK"
        preventCollapseOnMobile={isMobile}
      />

      <AnimatedExpandableContainer
        isExpanded={isOpen}
        dimension="height"
        mode="fit-content"
        containAnimation
      >
        <div>
          {folder.navigationMenuItems.map((navigationMenuItem, index) => (
            <NavigationDrawerSubItem
              key={navigationMenuItem.id}
              secondaryLabel={getNavigationMenuItemSecondaryLabel({
                objectMetadataItems,
                navigationMenuItemObjectNameSingular:
                  navigationMenuItem.objectNameSingular,
              })}
              label={navigationMenuItem.labelIdentifier}
              Icon={() => (
                <NavigationMenuItemIcon
                  navigationMenuItem={navigationMenuItem}
                />
              )}
              to={navigationMenuItem.link}
              active={index === selectedNavigationMenuItemIndex}
              subItemState={getNavigationSubItemLeftAdornment({
                index,
                arrayLength: navigationMenuItemFolderContentLength,
                selectedIndex: selectedNavigationMenuItemIndex,
              })}
              triggerEvent="CLICK"
            />
          ))}
        </div>
      </AnimatedExpandableContainer>
    </NavigationDrawerItemsCollapsableContainer>
  );
};
