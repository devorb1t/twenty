import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import {
  type WorkspaceSectionItem,
  useWorkspaceSectionItems,
} from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { useNavigationMenuItemsByFolder } from '@/navigation-menu-item/hooks/useNavigationMenuItemsByFolder';
import { processNavigationMenuItemToWorkspaceSectionItem } from '@/navigation-menu-item/utils/processNavigationMenuItemToWorkspaceSectionItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { coreViewsState } from '@/views/states/coreViewState';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';
import { isDefined } from 'twenty-shared/utils';

export const useFlattenedWorkspaceSectionItemsForLookup =
  (): WorkspaceSectionItem[] => {
    const workspaceSectionItems = useWorkspaceSectionItems();
    const { workspaceNavigationMenuItemsByFolder } =
      useNavigationMenuItemsByFolder();
    const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
    const coreViews = useRecoilValue(coreViewsState);
    const views = coreViews.map(convertCoreViewToView);

    return useMemo(() => {
      const folderItems: WorkspaceSectionItem[] = [];

      for (const folder of workspaceNavigationMenuItemsByFolder) {
        for (const navigationMenuItem of folder.navigationMenuItems) {
          const item = processNavigationMenuItemToWorkspaceSectionItem(
            navigationMenuItem,
            objectMetadataItems,
            views,
          );
          if (isDefined(item)) {
            folderItems.push(item);
          }
        }
      }

      return [...workspaceSectionItems, ...folderItems];
    }, [
      workspaceSectionItems,
      workspaceNavigationMenuItemsByFolder,
      objectMetadataItems,
      views,
    ]);
  };
