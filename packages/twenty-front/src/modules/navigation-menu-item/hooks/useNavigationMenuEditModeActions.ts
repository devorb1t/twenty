import { useRecoilCallback, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/states/isNavigationMenuInEditModeState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { selectedWorkspaceObjectMetadataItemIdInEditModeState } from '@/navigation-menu-item/states/selectedWorkspaceObjectMetadataItemIdInEditModeState';
import { prefetchNavigationMenuItemsState } from '@/prefetch/states/prefetchNavigationMenuItemsState';

export const useNavigationMenuEditModeActions = () => {
  const setIsNavigationMenuInEditMode = useSetRecoilState(
    isNavigationMenuInEditModeState,
  );
  const setNavigationMenuItemsDraft = useSetRecoilState(
    navigationMenuItemsDraftState,
  );
  const setSelectedObjectMetadataItemId = useSetRecoilState(
    selectedWorkspaceObjectMetadataItemIdInEditModeState,
  );

  const enterEditMode = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const prefetchNavigationMenuItems = snapshot
          .getLoadable(prefetchNavigationMenuItemsState)
          .getValue();

        const workspaceNavigationMenuItems = prefetchNavigationMenuItems.filter(
          (item) => !isDefined(item.userWorkspaceId),
        );

        set(navigationMenuItemsDraftState, [...workspaceNavigationMenuItems]);
        set(isNavigationMenuInEditModeState, true);
      },
    [],
  );

  const cancelEditMode = () => {
    setNavigationMenuItemsDraft(null);
    setSelectedObjectMetadataItemId(null);
    setIsNavigationMenuInEditMode(false);
  };

  return { enterEditMode, cancelEditMode };
};
