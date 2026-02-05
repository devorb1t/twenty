import { useCreateNavigationMenuItemMutation } from '~/generated-metadata/graphql';

import { ORPHAN_NAVIGATION_MENU_ITEMS_DROPPABLE_ID } from '@/navigation-menu-item/constants/NavigationMenuItemDroppableIds';
import { useSortedNavigationMenuItems } from '@/navigation-menu-item/hooks/useSortedNavigationMenuItems';
import { type AddToNavigationDragPayload } from '@/navigation-menu-item/types/add-to-navigation-drag-payload';
import { validateAndExtractFolderId } from '@/ui/layout/draggable-list/utils/validateAndExtractFolderId';
import { calculateNewPosition } from '@/ui/layout/draggable-list/utils/calculateNewPosition';

type DropTarget = {
  folderId: string | null;
  index: number;
};

export const useCreateNavigationMenuItemFromDrag = () => {
  const { workspaceNavigationMenuItemsSorted } = useSortedNavigationMenuItems();

  const [createNavigationMenuItemMutation] =
    useCreateNavigationMenuItemMutation({
      refetchQueries: ['FindManyNavigationMenuItems'],
      awaitRefetchQueries: true,
    });

  const getItemsInFolder = (folderId: string | null) =>
    workspaceNavigationMenuItemsSorted.filter(
      (item) => (item.folderId ?? null) === folderId,
    );

  const calculatePosition = (target: DropTarget): number => {
    const items = getItemsInFolder(target.folderId);
    if (items.length === 0) return 1;
    if (target.index === 0) return items[0].position - 1;
    if (target.index >= items.length) return items[items.length - 1].position + 1;
    return calculateNewPosition({
      destinationIndex: target.index,
      sourceIndex: -1,
      items,
    });
  };

  const createFromDrag = async (
    payload: AddToNavigationDragPayload,
    target: DropTarget,
  ): Promise<string | undefined> => {
    const position = Math.max(1, Math.round(calculatePosition(target)));
    const folderId = target.folderId ?? undefined;

    const baseInput = {
      userWorkspaceId: undefined,
      folderId,
      position,
    };

    if (payload.type === 'object') {
      const result = await createNavigationMenuItemMutation({
        variables: {
          input: {
            ...baseInput,
            targetObjectMetadataId: payload.objectMetadataId,
            viewId: payload.defaultViewId,
          },
        },
      });
      return result.data?.createNavigationMenuItem?.id;
    }

    if (payload.type === 'view') {
      const result = await createNavigationMenuItemMutation({
        variables: {
          input: {
            ...baseInput,
            viewId: payload.viewId,
          },
        },
      });
      return result.data?.createNavigationMenuItem?.id;
    }

    if (payload.type === 'record') {
      const result = await createNavigationMenuItemMutation({
        variables: {
          input: {
            ...baseInput,
            targetRecordId: payload.recordId,
            targetObjectMetadataId: payload.objectMetadataId,
          },
        },
      });
      return result.data?.createNavigationMenuItem?.id;
    }

    if (payload.type === 'folder') {
      const result = await createNavigationMenuItemMutation({
        variables: {
          input: {
            ...baseInput,
            name: payload.name,
          },
        },
      });
      return result.data?.createNavigationMenuItem?.id;
    }

    if (payload.type === 'link') {
      const trimmedUrl = payload.link.trim();
      const normalizedUrl =
        trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')
          ? trimmedUrl
          : `https://${trimmedUrl}`;
      const result = await createNavigationMenuItemMutation({
        variables: {
          input: {
            ...baseInput,
            name: payload.name || 'Link',
            link: normalizedUrl,
          },
        },
      });
      return result.data?.createNavigationMenuItem?.id;
    }

    return undefined;
  };

  const parseDropTargetFromDroppableId = (
    droppableId: string,
  ): { folderId: string | null } => {
    const folderId = validateAndExtractFolderId({
      droppableId,
      orphanDroppableId: ORPHAN_NAVIGATION_MENU_ITEMS_DROPPABLE_ID,
    });
    return { folderId };
  };

  return {
    createFromDrag,
    getItemsInFolder,
    parseDropTargetFromDroppableId,
  };
};
