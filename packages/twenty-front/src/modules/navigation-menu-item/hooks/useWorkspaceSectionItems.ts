import { useRecoilValue } from 'recoil';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/utils/getObjectMetadataForNavigationMenuItem';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/utils/isNavigationMenuItemFolder';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { coreViewsState } from '@/views/states/coreViewState';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';
import { isDefined } from 'twenty-shared/utils';

import { useNavigationMenuItemsByFolder } from './useNavigationMenuItemsByFolder';
import { usePrefetchedNavigationMenuItemsData } from './usePrefetchedNavigationMenuItemsData';
import { useSortedNavigationMenuItems } from './useSortedNavigationMenuItems';

export type FlatWorkspaceItem =
  | ProcessedNavigationMenuItem
  | (NavigationMenuItem & { itemType: 'folder' });

export type NavigationMenuItemClickParams = {
  item: FlatWorkspaceItem;
  objectMetadataItem?: ObjectMetadataItem | null;
};

export const useWorkspaceSectionItems = (): FlatWorkspaceItem[] => {
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

  const folderChildrenById = new Map(
    workspaceNavigationMenuItemsByFolder.map((folder) => [
      folder.id,
      folder.navigationMenuItems,
    ]),
  );

  const flatItems: FlatWorkspaceItem[] = flatWorkspaceItems.reduce<
    FlatWorkspaceItem[]
  >((acc, item) => {
    if (isNavigationMenuItemFolder(item)) {
      if (isDefined(folderChildrenById.get(item.id))) {
        acc.push({ ...item, itemType: 'folder' as const });
      }
    } else {
      const processedItem = processedObjectViewsById.get(item.id);
      if (!isDefined(processedItem)) {
        return acc;
      }
      if (processedItem.itemType === 'link') {
        acc.push(processedItem);
      } else {
        const objectMetadataItem = getObjectMetadataForNavigationMenuItem(
          processedItem,
          objectMetadataItems,
          views,
        );
        if (isDefined(objectMetadataItem)) {
          acc.push(processedItem);
        }
      }
    }
    return acc;
  }, []);

  return flatItems.flatMap((item) =>
    item.itemType === 'folder'
      ? [item, ...(folderChildrenById.get(item.id) ?? [])]
      : [item],
  );
};
