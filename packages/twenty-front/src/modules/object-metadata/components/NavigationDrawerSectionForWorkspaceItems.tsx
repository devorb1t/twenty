import { useTheme } from '@emotion/react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconLink } from 'twenty-ui/display';

import { NavigationItemDropTarget } from '@/navigation-menu-item/components/NavigationItemDropTarget';
import { WorkspaceNavigationMenuItemsFolder } from '@/navigation-menu-item/components/WorkspaceNavigationMenuItemsFolder';
import {
  type FlatWorkspaceItem,
  type NavigationMenuItemClickParams,
} from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { getNavigationMenuItemIconColors } from '@/navigation-menu-item/utils/getNavigationMenuItemIconColors';
import { getNavigationMenuItemType } from '@/navigation-menu-item/utils/getNavigationMenuItemType';
import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/utils/getObjectMetadataForNavigationMenuItem';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { NavigationDrawerItemForObjectMetadataItem } from '@/object-metadata/components/NavigationDrawerItemForObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { coreViewsState } from '@/views/states/coreViewState';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';

type NavigationDrawerSectionForWorkspaceItemsProps = {
  sectionTitle: string;
  items: FlatWorkspaceItem[];
  rightIcon?: React.ReactNode;
  isEditMode?: boolean;
  selectedNavigationMenuItemId?: string | null;
  onNavigationMenuItemClick?: (params: NavigationMenuItemClickParams) => void;
  onActiveObjectMetadataItemClick?: (
    objectMetadataItem: ObjectMetadataItem,
    navigationMenuItemId: string,
  ) => void;
};

export const NavigationDrawerSectionForWorkspaceItems = ({
  sectionTitle,
  items,
  rightIcon,
  isEditMode = false,
  selectedNavigationMenuItemId = null,
  onNavigationMenuItemClick,
  onActiveObjectMetadataItemClick,
}: NavigationDrawerSectionForWorkspaceItemsProps) => {
  const theme = useTheme();
  const { toggleNavigationSection, isNavigationSectionOpenState } =
    useNavigationSection('Workspace');
  const isNavigationSectionOpen = useRecoilValue(isNavigationSectionOpenState);
  const coreViews = useRecoilValue(coreViewsState);
  const views = coreViews.map(convertCoreViewToView);

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const flatItems = items.filter((item) => !isDefined(item.folderId));
  const folderChildrenById = items.reduce<
    Map<string, ProcessedNavigationMenuItem[]>
  >((acc, item) => {
    const folderId = item.folderId;
    if (isDefined(folderId)) {
      const children = acc.get(folderId) ?? [];
      children.push(item as ProcessedNavigationMenuItem);
      acc.set(folderId, children);
    }
    return acc;
  }, new Map());

  const folderCount = flatItems.filter(
    (item) => getNavigationMenuItemType(item) === 'folder',
  ).length;

  const filteredItems = flatItems.filter((item) => {
    const type = getNavigationMenuItemType(item);
    if (type === 'folder' || type === 'link') {
      return true;
    }
    if (type === 'objectView' || type === 'recordView') {
      const objectMetadataItem = getObjectMetadataForNavigationMenuItem(
        item as ProcessedNavigationMenuItem,
        objectMetadataItems,
        views,
      );
      return (
        isDefined(objectMetadataItem) &&
        getObjectPermissionsForObject(
          objectPermissionsByObjectMetadataId,
          objectMetadataItem.id,
        ).canReadObjectRecords
      );
    }
    return false;
  });

  const getEditModeProps = (item: FlatWorkspaceItem) => {
    const itemId = item.id;
    return {
      isSelectedInEditMode: selectedNavigationMenuItemId === itemId,
      onEditModeClick: onNavigationMenuItemClick
        ? () => {
            const type = getNavigationMenuItemType(item);
            const objectMetadataItem =
              type === 'objectView' || type === 'recordView'
                ? getObjectMetadataForNavigationMenuItem(
                    item as ProcessedNavigationMenuItem,
                    objectMetadataItems,
                    views,
                  )
                : null;
            onNavigationMenuItemClick({
              item,
              objectMetadataItem: objectMetadataItem ?? undefined,
            });
          }
        : undefined,
    };
  };

  if (flatItems.length === 0) {
    return null;
  }

  return (
    <NavigationDrawerSection>
      <NavigationDrawerAnimatedCollapseWrapper>
        <NavigationDrawerSectionTitle
          label={sectionTitle}
          onClick={() => toggleNavigationSection()}
          rightIcon={rightIcon}
        />
      </NavigationDrawerAnimatedCollapseWrapper>
      {isNavigationSectionOpen && (
        <>
          {filteredItems.map((item, index) => {
            const type = getNavigationMenuItemType(item);
            const editModeProps = getEditModeProps(item);

            if (type === 'folder') {
              return (
                <NavigationItemDropTarget
                  key={item.id}
                  folderId={null}
                  index={index}
                >
                  <WorkspaceNavigationMenuItemsFolder
                    folderId={item.id}
                    folderName={item.name ?? 'Folder'}
                    navigationMenuItems={folderChildrenById.get(item.id) ?? []}
                    isGroup={folderCount > 1}
                    isEditMode={isEditMode}
                    isSelectedInEditMode={editModeProps.isSelectedInEditMode}
                    onEditModeClick={editModeProps.onEditModeClick}
                    onNavigationMenuItemClick={onNavigationMenuItemClick}
                    selectedNavigationMenuItemId={selectedNavigationMenuItemId}
                  />
                </NavigationItemDropTarget>
              );
            }

            if (type === 'link') {
              const linkItem = item as ProcessedNavigationMenuItem;
              const iconColors = getNavigationMenuItemIconColors(theme);
              return (
                <NavigationItemDropTarget
                  key={item.id}
                  folderId={null}
                  index={index}
                >
                  <NavigationDrawerItem
                    label={linkItem.labelIdentifier}
                    to={linkItem.link}
                    onClick={
                      isEditMode ? editModeProps.onEditModeClick : undefined
                    }
                    Icon={IconLink}
                    iconBackgroundColor={iconColors.link}
                    active={false}
                    isSelectedInEditMode={editModeProps.isSelectedInEditMode}
                  />
                </NavigationItemDropTarget>
              );
            }

            const objectMetadataItem = getObjectMetadataForNavigationMenuItem(
              item as ProcessedNavigationMenuItem,
              objectMetadataItems,
              views,
            );
            if (!objectMetadataItem) return null;

            return (
              <NavigationItemDropTarget
                key={item.id}
                folderId={null}
                index={index}
              >
                <NavigationDrawerItemForObjectMetadataItem
                  objectMetadataItem={objectMetadataItem}
                  navigationMenuItem={item as ProcessedNavigationMenuItem}
                  isEditMode={isEditMode}
                  isSelectedInEditMode={editModeProps.isSelectedInEditMode}
                  onEditModeClick={editModeProps.onEditModeClick}
                  onActiveItemClickWhenNotInEditMode={
                    onActiveObjectMetadataItemClick
                      ? () =>
                          onActiveObjectMetadataItemClick(
                            objectMetadataItem,
                            item.id,
                          )
                      : undefined
                  }
                />
              </NavigationItemDropTarget>
            );
          })}
          <NavigationItemDropTarget
            folderId={null}
            index={filteredItems.length}
          />
        </>
      )}
    </NavigationDrawerSection>
  );
};
