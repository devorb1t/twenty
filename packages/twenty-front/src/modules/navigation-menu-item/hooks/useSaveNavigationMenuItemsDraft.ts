import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

import { useCreateNavigationMenuItemMutation } from '~/generated-metadata/graphql';

import { useDeleteNavigationMenuItem } from '@/navigation-menu-item/hooks/useDeleteNavigationMenuItem';
import { useUpdateNavigationMenuItem } from '@/navigation-menu-item/hooks/useUpdateNavigationMenuItem';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/utils/isNavigationMenuItemFolder';
import { prefetchNavigationMenuItemsState } from '@/prefetch/states/prefetchNavigationMenuItemsState';

export const useSaveNavigationMenuItemsDraft = () => {
  const { updateNavigationMenuItem } = useUpdateNavigationMenuItem();
  const { deleteNavigationMenuItem } = useDeleteNavigationMenuItem();
  const [createNavigationMenuItemMutation] =
    useCreateNavigationMenuItemMutation({
      refetchQueries: ['FindManyNavigationMenuItems'],
    });

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
          (item) => !isDefined(item.userWorkspaceId),
        );
        const topLevelWorkspace = workspacePrefetch.filter(
          (item) => !isDefined(item.folderId),
        );
        const draftIds = new Set(draft.map((i) => i.id));

        const topLevelToDelete = topLevelWorkspace.filter(
          (item) => !draftIds.has(item.id),
        );
        const folderIdsToDelete = new Set(
          topLevelToDelete
            .filter(isNavigationMenuItemFolder)
            .map((item) => item.id),
        );
        const folderChildrenToDelete = prefetch.filter(
          (item) =>
            isDefined(item.folderId) && folderIdsToDelete.has(item.folderId),
        );

        for (const item of folderChildrenToDelete) {
          await deleteNavigationMenuItem(item.id);
        }
        for (const item of topLevelToDelete) {
          await deleteNavigationMenuItem(item.id);
        }

        const prefetchIds = new Set(workspacePrefetch.map((i) => i.id));
        const idsToCreate = draft.filter((item) => !prefetchIds.has(item.id));

        for (const draftItem of idsToCreate) {
          const input: {
            position: number;
            viewId?: string;
            targetObjectMetadataId?: string;
            targetRecordId?: string;
          } = { position: draftItem.position };

          if (isDefined(draftItem.viewId)) {
            input.viewId = draftItem.viewId;
            input.targetObjectMetadataId =
              draftItem.targetObjectMetadataId ?? undefined;
          } else if (isDefined(draftItem.targetRecordId)) {
            input.targetRecordId = draftItem.targetRecordId;
            input.targetObjectMetadataId =
              draftItem.targetObjectMetadataId ?? undefined;
          }

          await createNavigationMenuItemMutation({
            variables: { input },
          });
        }

        for (const draftItem of draft) {
          const original = topLevelWorkspace.find((p) => p.id === draftItem.id);
          if (isDefined(original) && original.position !== draftItem.position) {
            await updateNavigationMenuItem({
              id: draftItem.id,
              position: draftItem.position,
            });
          }
        }
      },
    [
      updateNavigationMenuItem,
      deleteNavigationMenuItem,
      createNavigationMenuItemMutation,
    ],
  );

  return { saveDraft };
};
