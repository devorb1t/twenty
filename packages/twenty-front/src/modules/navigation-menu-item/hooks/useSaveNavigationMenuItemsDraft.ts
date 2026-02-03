import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

import { useDeleteNavigationMenuItem } from '@/navigation-menu-item/hooks/useDeleteNavigationMenuItem';
import { useUpdateNavigationMenuItem } from '@/navigation-menu-item/hooks/useUpdateNavigationMenuItem';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { prefetchNavigationMenuItemsState } from '@/prefetch/states/prefetchNavigationMenuItemsState';

export const useSaveNavigationMenuItemsDraft = () => {
  const { updateNavigationMenuItem } = useUpdateNavigationMenuItem();
  const { deleteNavigationMenuItem } = useDeleteNavigationMenuItem();

  const saveDraft = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const draft = snapshot
          .getLoadable(navigationMenuItemsDraftState)
          .getValue();
        const prefetch = snapshot
          .getLoadable(prefetchNavigationMenuItemsState)
          .getValue();

        if (!draft) return;

        const workspacePrefetch = prefetch.filter(
          (item) => !isDefined(item.folderId),
        );
        const draftIds = new Set(draft.map((i) => i.id));

        const idsToDelete = workspacePrefetch.filter(
          (item) => !draftIds.has(item.id),
        );

        const toDeleteSorted = [...idsToDelete].sort((a, b) => {
          const aHasFolder = isDefined(a.folderId);
          const bHasFolder = isDefined(b.folderId);
          if (aHasFolder && !bHasFolder) return -1;
          if (!aHasFolder && bHasFolder) return 1;
          return 0;
        });

        for (const item of toDeleteSorted) {
          await deleteNavigationMenuItem(item.id);
        }

        for (const draftItem of draft) {
          const original = workspacePrefetch.find((p) => p.id === draftItem.id);
          if (isDefined(original) && original.position !== draftItem.position) {
            await updateNavigationMenuItem({
              id: draftItem.id,
              position: draftItem.position,
            });
          }
        }
      },
    [updateNavigationMenuItem, deleteNavigationMenuItem],
  );

  return { saveDraft };
};
