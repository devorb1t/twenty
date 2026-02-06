import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { IconFolder, IconFolderOpen } from 'twenty-ui/display';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';
import { useIsMobile } from 'twenty-ui/utilities';

import { NavigationItemDropTarget } from '@/navigation-menu-item/components/NavigationItemDropTarget';
import { NavigationMenuItemIcon } from '@/navigation-menu-item/components/NavigationMenuItemIcon';
import { type NavigationMenuItemClickParams } from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { openNavigationMenuItemFolderIdsState } from '@/navigation-menu-item/states/openNavigationMenuItemFolderIdsState';
import { getNavigationMenuItemIconColors } from '@/navigation-menu-item/utils/getNavigationMenuItemIconColors';
import { getNavigationMenuItemSecondaryLabel } from '@/navigation-menu-item/utils/getNavigationMenuItemSecondaryLabel';
import { getNavigationMenuItemType } from '@/navigation-menu-item/utils/getNavigationMenuItemType';
import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/utils/getObjectMetadataForNavigationMenuItem';
import { isLocationMatchingNavigationMenuItem } from '@/navigation-menu-item/utils/isLocationMatchingNavigationMenuItem';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerItemsCollapsableContainer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemsCollapsableContainer';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { currentNavigationMenuItemFolderIdState } from '@/ui/navigation/navigation-drawer/states/currentNavigationMenuItemFolderIdState';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { coreViewsState } from '@/views/states/coreViewState';
import { ViewKey } from '@/views/types/ViewKey';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';
import { isDefined } from 'twenty-shared/utils';

const StyledFolderContainer = styled.div<{ $isSelectedInEditMode: boolean }>`
  border: ${({ theme, $isSelectedInEditMode }) =>
    $isSelectedInEditMode
      ? `1px solid ${theme.color.blue}`
      : '1px solid transparent'};
  border-radius: ${({ theme }) => theme.border.radius.sm};
`;

type WorkspaceNavigationMenuItemsFolderProps = {
  folderId: string;
  folderName: string;
  navigationMenuItems: ProcessedNavigationMenuItem[];
  isGroup: boolean;
  isEditMode?: boolean;
  isSelectedInEditMode?: boolean;
  onEditModeClick?: () => void;
  onNavigationMenuItemClick?: (params: NavigationMenuItemClickParams) => void;
  selectedNavigationMenuItemId?: string | null;
};

export const WorkspaceNavigationMenuItemsFolder = ({
  folderId,
  folderName,
  navigationMenuItems,
  isGroup,
  isEditMode = false,
  isSelectedInEditMode = false,
  onEditModeClick,
  onNavigationMenuItemClick,
  selectedNavigationMenuItemId = null,
}: WorkspaceNavigationMenuItemsFolderProps) => {
  const theme = useTheme();
  const iconColors = getNavigationMenuItemIconColors(theme);
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const coreViews = useRecoilValue(coreViewsState);
  const views = coreViews.map(convertCoreViewToView);
  const currentPath = useLocation().pathname;
  const currentViewPath = useLocation().pathname + useLocation().search;
  const isMobile = useIsMobile();

  const [openNavigationMenuItemFolderIds, setOpenNavigationMenuItemFolderIds] =
    useRecoilState(openNavigationMenuItemFolderIdsState);

  const setCurrentFolderId = useSetRecoilState(
    currentNavigationMenuItemFolderIdState,
  );

  const isOpen = openNavigationMenuItemFolderIds.includes(folderId);

  const handleToggle = () => {
    if (isMobile) {
      setCurrentFolderId((prev) => (prev === folderId ? null : folderId));
    } else {
      setOpenNavigationMenuItemFolderIds((currentOpenFolders) => {
        if (isOpen) {
          return currentOpenFolders.filter((id) => id !== folderId);
        } else {
          return [...currentOpenFolders, folderId];
        }
      });
    }
  };

  const shouldUseEditModeClick = isEditMode && Boolean(onEditModeClick);
  const handleClick = shouldUseEditModeClick ? onEditModeClick : handleToggle;

  const selectedNavigationMenuItemIndex = navigationMenuItems.findIndex(
    (item) =>
      isLocationMatchingNavigationMenuItem(currentPath, currentViewPath, item),
  );

  const navigationMenuItemFolderContentLength = navigationMenuItems.length;

  return (
    <StyledFolderContainer
      key={folderId}
      $isSelectedInEditMode={isSelectedInEditMode}
    >
      <NavigationDrawerItemsCollapsableContainer isGroup={isGroup}>
        <NavigationItemDropTarget folderId={folderId} index={0}>
          <NavigationDrawerItem
            label={folderName}
            Icon={isOpen ? IconFolderOpen : IconFolder}
            iconBackgroundColor={iconColors.folder}
            onClick={handleClick}
            className="navigation-drawer-item"
            triggerEvent="CLICK"
            preventCollapseOnMobile={isMobile}
          />
        </NavigationItemDropTarget>

        <AnimatedExpandableContainer
          isExpanded={isOpen}
          dimension="height"
          mode="fit-content"
          containAnimation
        >
          <div>
            <NavigationItemDropTarget folderId={folderId} index={0} />
            {navigationMenuItems.map((navigationMenuItem, index) => {
              const type = getNavigationMenuItemType(navigationMenuItem);
              const objectMetadataItem =
                type === 'objectView' || type === 'recordView'
                  ? getObjectMetadataForNavigationMenuItem(
                      navigationMenuItem,
                      objectMetadataItems,
                      views,
                    )
                  : null;
              const isSelectedInEditModeForItem =
                selectedNavigationMenuItemId === navigationMenuItem.id;
              const handleEditModeClick =
                isEditMode &&
                isDefined(onNavigationMenuItemClick) &&
                (type === 'link' || isDefined(objectMetadataItem))
                  ? () =>
                      onNavigationMenuItemClick({
                        item: navigationMenuItem,
                        objectMetadataItem: objectMetadataItem ?? undefined,
                      })
                  : undefined;

              return (
                <NavigationItemDropTarget
                  key={navigationMenuItem.id}
                  folderId={folderId}
                  index={index}
                >
                  <NavigationDrawerSubItem
                    key={navigationMenuItem.id}
                    secondaryLabel={
                      navigationMenuItem.viewKey === ViewKey.Index
                        ? undefined
                        : getNavigationMenuItemSecondaryLabel({
                            objectMetadataItems,
                            navigationMenuItemObjectNameSingular:
                              navigationMenuItem.objectNameSingular,
                          })
                    }
                    label={navigationMenuItem.labelIdentifier}
                    Icon={() => (
                      <NavigationMenuItemIcon
                        navigationMenuItem={navigationMenuItem}
                      />
                    )}
                    to={
                      handleEditModeClick ? undefined : navigationMenuItem.link
                    }
                    onClick={handleEditModeClick}
                    active={index === selectedNavigationMenuItemIndex}
                    isSelectedInEditMode={isSelectedInEditModeForItem}
                    subItemState={getNavigationSubItemLeftAdornment({
                      index,
                      arrayLength: navigationMenuItemFolderContentLength,
                      selectedIndex: selectedNavigationMenuItemIndex,
                    })}
                    triggerEvent="CLICK"
                  />
                </NavigationItemDropTarget>
              );
            })}
            <NavigationItemDropTarget
              folderId={folderId}
              index={navigationMenuItems.length}
            />
          </div>
        </AnimatedExpandableContainer>
      </NavigationDrawerItemsCollapsableContainer>
    </StyledFolderContainer>
  );
};
