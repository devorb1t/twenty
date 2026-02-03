import { WorkspaceNavigationMenuItemsFolder } from '@/navigation-menu-item/components/WorkspaceNavigationMenuItemsFolder';
import { type WorkspaceSectionItem } from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
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
  selectedObjectMetadataItemId?: string | null;
  onObjectMetadataItemClick?: (objectMetadataItem: ObjectMetadataItem) => void;
  onActiveObjectMetadataItemClick?: (
    objectMetadataItem: ObjectMetadataItem,
  ) => void;
};

export const NavigationDrawerSectionForWorkspaceItems = ({
  sectionTitle,
  workspaceSectionItems,
  rightIcon,
  isEditMode = false,
  selectedObjectMetadataItemId = null,
  onObjectMetadataItemClick,
  onActiveObjectMetadataItemClick,
}: NavigationDrawerSectionForWorkspaceItemsProps) => {
  const { toggleNavigationSection, isNavigationSectionOpenState } =
    useNavigationSection('Workspace');
  const isNavigationSectionOpen = useRecoilValue(isNavigationSectionOpenState);

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const folderCount = workspaceSectionItems.filter(
    (item) => item.type === 'folder',
  ).length;

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
      {isNavigationSectionOpen &&
        workspaceSectionItems
          .filter(
            (item) =>
              item.type === 'folder' ||
              (item.type === 'objectView' &&
                getObjectPermissionsForObject(
                  objectPermissionsByObjectMetadataId,
                  item.objectMetadataItem.id,
                ).canReadObjectRecords),
          )
          .map((item) =>
            item.type === 'folder' ? (
              <WorkspaceNavigationMenuItemsFolder
                key={item.folder.folderId}
                folder={item.folder}
                isGroup={folderCount > 1}
              />
            ) : (
              <NavigationDrawerItemForObjectMetadataItem
                key={`navigation-drawer-item-${item.objectMetadataItem.id}`}
                objectMetadataItem={item.objectMetadataItem}
                isEditMode={isEditMode}
                isSelectedInEditMode={
                  selectedObjectMetadataItemId === item.objectMetadataItem.id
                }
                onEditModeClick={
                  onObjectMetadataItemClick
                    ? () => onObjectMetadataItemClick(item.objectMetadataItem)
                    : undefined
                }
                onActiveItemClickWhenNotInEditMode={
                  onActiveObjectMetadataItemClick
                    ? () =>
                        onActiveObjectMetadataItemClick(item.objectMetadataItem)
                    : undefined
                }
              />
            ),
          )}
    </NavigationDrawerSection>
  );
};
