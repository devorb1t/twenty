import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { IconFolder, IconFolderOpen } from 'twenty-ui/display';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';
import { useIsMobile } from 'twenty-ui/utilities';

import { NavigationItemDropTarget } from '@/navigation-menu-item/components/NavigationItemDropTarget';
import { NavigationMenuItemIcon } from '@/navigation-menu-item/components/NavigationMenuItemIcon';
import { type WorkspaceSectionItem } from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { openNavigationMenuItemFolderIdsState } from '@/navigation-menu-item/states/openNavigationMenuItemFolderIdsState';
import { getNavigationMenuItemIconColors } from '@/navigation-menu-item/utils/getNavigationMenuItemIconColors';
import { getNavigationMenuItemSecondaryLabel } from '@/navigation-menu-item/utils/getNavigationMenuItemSecondaryLabel';
import { isLocationMatchingNavigationMenuItem } from '@/navigation-menu-item/utils/isLocationMatchingNavigationMenuItem';
import { processNavigationMenuItemToWorkspaceSectionItem } from '@/navigation-menu-item/utils/processNavigationMenuItemToWorkspaceSectionItem';
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
  folder: {
    id: string;
    folderName: string;
    navigationMenuItems: ProcessedNavigationMenuItem[];
  };
  isGroup: boolean;
  isEditMode?: boolean;
  isSelectedInEditMode?: boolean;
  onEditModeClick?: () => void;
  onNavigationMenuItemClick?: (item: WorkspaceSectionItem) => void;
  selectedNavigationMenuItemId?: string | null;
};

export const WorkspaceNavigationMenuItemsFolder = ({
  folder,
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

  const isOpen = openNavigationMenuItemFolderIds.includes(folder.id);

  const handleToggle = () => {
    if (isMobile) {
      setCurrentFolderId((prev) => (prev === folder.id ? null : folder.id));
    } else {
      setOpenNavigationMenuItemFolderIds((currentOpenFolders) => {
        if (isOpen) {
          return currentOpenFolders.filter((id) => id !== folder.id);
        } else {
          return [...currentOpenFolders, folder.id];
        }
      });
    }
  };

  const shouldUseEditModeClick = isEditMode && Boolean(onEditModeClick);
  const handleClick = shouldUseEditModeClick ? onEditModeClick : handleToggle;

  const selectedNavigationMenuItemIndex = folder.navigationMenuItems.findIndex(
    (item) =>
      isLocationMatchingNavigationMenuItem(currentPath, currentViewPath, item),
  );

  const navigationMenuItemFolderContentLength =
    folder.navigationMenuItems.length;

  return (
    <StyledFolderContainer
      key={folder.id}
      $isSelectedInEditMode={isSelectedInEditMode}
    >
      <NavigationDrawerItemsCollapsableContainer isGroup={isGroup}>
        <NavigationItemDropTarget folderId={folder.id} index={0}>
          <NavigationDrawerItem
            label={folder.folderName}
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
            <NavigationItemDropTarget folderId={folder.id} index={0} />
            {folder.navigationMenuItems.map((navigationMenuItem, index) => {
              const workspaceSectionItem =
                processNavigationMenuItemToWorkspaceSectionItem(
                  navigationMenuItem,
                  objectMetadataItems,
                  views,
                );
              const isSelectedInEditModeForItem =
                selectedNavigationMenuItemId === navigationMenuItem.id;
              const handleEditModeClick =
                isEditMode &&
                isDefined(onNavigationMenuItemClick) &&
                isDefined(workspaceSectionItem)
                  ? () => onNavigationMenuItemClick(workspaceSectionItem)
                  : undefined;

              return (
                <NavigationItemDropTarget
                  key={navigationMenuItem.id}
                  folderId={folder.id}
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
              folderId={folder.id}
              index={folder.navigationMenuItems.length}
            />
          </div>
        </AnimatedExpandableContainer>
      </NavigationDrawerItemsCollapsableContainer>
    </StyledFolderContainer>
  );
};
