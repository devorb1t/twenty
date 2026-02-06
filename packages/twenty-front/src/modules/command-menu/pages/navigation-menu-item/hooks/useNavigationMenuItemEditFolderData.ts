import { useNavigationMenuItemsByFolder } from '@/navigation-menu-item/hooks/useNavigationMenuItemsByFolder';
import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/hooks/useNavigationMenuItemsDraftState';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/utils/isNavigationMenuItemFolder';

export const useNavigationMenuItemEditFolderData = () => {
  const { workspaceNavigationMenuItems, navigationMenuItemsDraft } =
    useNavigationMenuItemsDraftState();
  const { workspaceNavigationMenuItemsByFolder } =
    useNavigationMenuItemsByFolder();

  const currentDraft = navigationMenuItemsDraft ?? workspaceNavigationMenuItems;

  const workspaceFolders = workspaceNavigationMenuItemsByFolder.map(
    (folder) => ({
      id: folder.id,
      name: folder.folderName,
    }),
  );

  const allFolders =
    currentDraft?.filter(isNavigationMenuItemFolder).map((item) => ({
      id: item.id,
      name: item.name ?? 'Folder',
      folderId: item.folderId ?? undefined,
    })) ?? [];

  return {
    allFolders,
    workspaceFolders,
    currentDraft,
  };
};
