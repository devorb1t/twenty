import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/utils/isNavigationMenuItemFolder';

export const useNavigationMenuItemMoveRemove = () => {
  const setNavigationMenuItemsDraft = useSetRecoilState(
    navigationMenuItemsDraftState,
  );

  const moveUp = (navigationMenuItemId: string) => {
    setNavigationMenuItemsDraft((draft) => {
      if (!draft) return draft;

      const flatItems = draft
        .filter((item) => !isDefined(item.folderId))
        .sort((a, b) => a.position - b.position);

      const currentIndex = flatItems.findIndex(
        (item) => item.id === navigationMenuItemId,
      );
      if (currentIndex <= 0) return draft;

      const itemAbove = flatItems[currentIndex - 1];
      const currentItem = flatItems[currentIndex];
      const newDraft = draft.map((item) => {
        if (item.id === currentItem.id) {
          return { ...item, position: itemAbove.position };
        }
        if (item.id === itemAbove.id) {
          return { ...item, position: currentItem.position };
        }
        return item;
      });

      return newDraft;
    });
  };

  const moveDown = (navigationMenuItemId: string) => {
    setNavigationMenuItemsDraft((draft) => {
      if (!draft) return draft;

      const flatItems = draft
        .filter((item) => !isDefined(item.folderId))
        .sort((a, b) => a.position - b.position);

      const currentIndex = flatItems.findIndex(
        (item) => item.id === navigationMenuItemId,
      );
      if (currentIndex < 0 || currentIndex >= flatItems.length - 1) {
        return draft;
      }

      const itemBelow = flatItems[currentIndex + 1];
      const currentItem = flatItems[currentIndex];
      const newDraft = draft.map((item) => {
        if (item.id === currentItem.id) {
          return { ...item, position: itemBelow.position };
        }
        if (item.id === itemBelow.id) {
          return { ...item, position: currentItem.position };
        }
        return item;
      });

      return newDraft;
    });
  };

  const remove = (navigationMenuItemId: string) => {
    setNavigationMenuItemsDraft((draft) => {
      if (!draft) return draft;

      const itemToRemove = draft.find(
        (item) => item.id === navigationMenuItemId,
      );
      if (!itemToRemove) return draft;

      const isFolder = isNavigationMenuItemFolder(itemToRemove);

      if (isFolder) {
        return draft.filter(
          (item) =>
            item.id !== navigationMenuItemId &&
            item.folderId !== navigationMenuItemId,
        );
      }

      return draft.filter((item) => item.id !== navigationMenuItemId);
    });
  };

  const moveToFolder = (
    navigationMenuItemId: string,
    targetFolderId: string | null,
  ) => {
    setNavigationMenuItemsDraft((draft) => {
      if (!draft) return draft;

      const itemToMove = draft.find(
        (item) => item.id === navigationMenuItemId,
      );
      if (!itemToMove) return draft;

      if (isNavigationMenuItemFolder(itemToMove)) {
        return draft;
      }

      const itemsInTargetFolder = draft.filter((item) =>
        targetFolderId === null
          ? !isDefined(item.folderId)
          : item.folderId === targetFolderId,
      );
      const maxPositionInTarget =
        itemsInTargetFolder.length > 0
          ? Math.max(...itemsInTargetFolder.map((item) => item.position))
          : -1;
      const newPosition = maxPositionInTarget + 1;

      return draft.map((item) =>
        item.id === navigationMenuItemId
          ? {
              ...item,
              folderId: targetFolderId ?? undefined,
              position: newPosition,
            }
          : item,
      );
    });
  };

  return { moveUp, moveDown, remove, moveToFolder };
};
