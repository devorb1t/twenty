import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

import { isNavigationMenuItemFolder } from '@/navigation-menu-item/utils/isNavigationMenuItemFolder';
import { processNavigationMenuItemToWorkspaceSectionItem } from '@/navigation-menu-item/utils/processNavigationMenuItemToWorkspaceSectionItem';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { coreViewsState } from '@/views/states/coreViewState';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';

import { useNavigationMenuItemsByFolder } from './useNavigationMenuItemsByFolder';
import { usePrefetchedNavigationMenuItemsData } from './usePrefetchedNavigationMenuItemsData';
import { useSortedNavigationMenuItems } from './useSortedNavigationMenuItems';

type WorkspaceFolder = {
  id: string;
  folderName: string;
  navigationMenuItems: ProcessedNavigationMenuItem[];
};

export type WorkspaceSectionItem =
  | { type: 'folder'; id: string; folder: WorkspaceFolder }
  | {
      type: 'objectView';
      id: string;
      navigationMenuItem: ProcessedNavigationMenuItem;
      objectMetadataItem: ObjectMetadataItem;
    }
  | {
      type: 'link';
      id: string;
      navigationMenuItem: ProcessedNavigationMenuItem;
    };

export const useWorkspaceSectionItems = (): WorkspaceSectionItem[] => {
  const { workspaceNavigationMenuItems } =
    usePrefetchedNavigationMenuItemsData();
  const { workspaceNavigationMenuItemsSorted } = useSortedNavigationMenuItems();
  const { workspaceNavigationMenuItemsByFolder } =
    useNavigationMenuItemsByFolder();
  const coreViews = useRecoilValue(coreViewsState);
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const views = coreViews.map(convertCoreViewToView);

  const flatWorkspaceItems = workspaceNavigationMenuItems
    .filter((item) => !isDefined(item.folderId))
    .sort((a, b) => a.position - b.position);

  const processedObjectViewsById = new Map(
    workspaceNavigationMenuItemsSorted.map((item) => [item.id, item]),
  );

  const workspaceFoldersById = new Map(
    workspaceNavigationMenuItemsByFolder.map((folder) => [folder.id, folder]),
  );

  return flatWorkspaceItems.reduce<WorkspaceSectionItem[]>((acc, item) => {
    if (isNavigationMenuItemFolder(item)) {
      const folder = workspaceFoldersById.get(item.id);
      if (isDefined(folder)) {
        acc.push({ type: 'folder', id: folder.id, folder });
      }
    } else {
      const processedItem = processedObjectViewsById.get(item.id);
      if (!isDefined(processedItem)) {
        return acc;
      }
      const workspaceItem = processNavigationMenuItemToWorkspaceSectionItem(
        processedItem,
        objectMetadataItems,
        views,
      );
      if (isDefined(workspaceItem)) {
        acc.push(workspaceItem);
      }
    }
    return acc;
  }, []);
};
