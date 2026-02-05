import { NavigationDrawerItemForLink } from '@/navigation-menu-item/components/NavigationDrawerItemForLink';
import { NavigationItemDropTarget } from '@/navigation-menu-item/components/NavigationItemDropTarget';
import { WorkspaceNavigationMenuItemsFolder } from '@/navigation-menu-item/components/WorkspaceNavigationMenuItemsFolder';
import { type WorkspaceSectionItem } from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { getWorkspaceSectionItemId } from '@/navigation-menu-item/utils/getWorkspaceSectionItemId';
import { NavigationDrawerItemForObjectMetadataItem } from '@/object-metadata/components/NavigationDrawerItemForObjectMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { useRecoilValue } from 'recoil';

type NavigationDrawerSectionForWorkspaceItemsProps = {
  sectionTitle: string;
  workspaceSectionItems: WorkspaceSectionItem[];
  rightIcon?: React.ReactNode;
  isEditMode?: boolean;
  selectedNavigationMenuItemId?: string | null;
  onNavigationMenuItemClick?: (item: WorkspaceSectionItem) => void;
  onActiveObjectMetadataItemClick?: (
    objectMetadataItem: ObjectMetadataItem,
    navigationMenuItemId: string,
  ) => void;
};

export const NavigationDrawerSectionForWorkspaceItems = ({
  sectionTitle,
  workspaceSectionItems,
  rightIcon,
  isEditMode = false,
  selectedNavigationMenuItemId = null,
  onNavigationMenuItemClick,
  onActiveObjectMetadataItemClick,
}: NavigationDrawerSectionForWorkspaceItemsProps) => {
  const { toggleNavigationSection, isNavigationSectionOpenState } =
    useNavigationSection('Workspace');
  const isNavigationSectionOpen = useRecoilValue(isNavigationSectionOpenState);

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const folderCount = workspaceSectionItems.filter(
    (item) => item.type === 'folder',
  ).length;

  const filteredWorkspaceSectionItems = workspaceSectionItems.filter(
    (item) =>
      item.type === 'folder' ||
      item.type === 'link' ||
      (item.type === 'objectView' &&
        getObjectPermissionsForObject(
          objectPermissionsByObjectMetadataId,
          item.objectMetadataItem.id,
        ).canReadObjectRecords),
  );

  const getEditModeProps = (item: WorkspaceSectionItem) => {
    const itemId = getWorkspaceSectionItemId(item);
    return {
      isSelectedInEditMode: selectedNavigationMenuItemId === itemId,
      onEditModeClick: onNavigationMenuItemClick
        ? () => onNavigationMenuItemClick(item)
        : undefined,
    };
  };

  if (workspaceSectionItems.length === 0) {
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
          {filteredWorkspaceSectionItems.map((item, index) => {
            const editModeProps = getEditModeProps(item);
            return (
              <NavigationItemDropTarget
                key={getWorkspaceSectionItemId(item)}
                folderId={null}
                index={index}
              >
                {item.type === 'folder' ? (
                  <WorkspaceNavigationMenuItemsFolder
                    folder={item.folder}
                    isGroup={folderCount > 1}
                    isEditMode={isEditMode}
                    isSelectedInEditMode={editModeProps.isSelectedInEditMode}
                    onEditModeClick={editModeProps.onEditModeClick}
                    onNavigationMenuItemClick={onNavigationMenuItemClick}
                    selectedNavigationMenuItemId={selectedNavigationMenuItemId}
                  />
                ) : item.type === 'link' ? (
                  <NavigationDrawerItemForLink
                    navigationMenuItem={item.navigationMenuItem}
                    isEditMode={isEditMode}
                    isSelectedInEditMode={editModeProps.isSelectedInEditMode}
                    onEditModeClick={editModeProps.onEditModeClick}
                  />
                ) : (
                  <NavigationDrawerItemForObjectMetadataItem
                    objectMetadataItem={item.objectMetadataItem}
                    navigationMenuItem={item.navigationMenuItem}
                    isEditMode={isEditMode}
                    isSelectedInEditMode={editModeProps.isSelectedInEditMode}
                    onEditModeClick={editModeProps.onEditModeClick}
                    onActiveItemClickWhenNotInEditMode={
                      onActiveObjectMetadataItemClick
                        ? () =>
                            onActiveObjectMetadataItemClick(
                              item.objectMetadataItem,
                              item.navigationMenuItem.id,
                            )
                        : undefined
                    }
                  />
                )}
              </NavigationItemDropTarget>
            );
          })}
          <NavigationItemDropTarget
            folderId={null}
            index={filteredWorkspaceSectionItems.length}
          />
        </>
      )}
    </NavigationDrawerSection>
  );
};
