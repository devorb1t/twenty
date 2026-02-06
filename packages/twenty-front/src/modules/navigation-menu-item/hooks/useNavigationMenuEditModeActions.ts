import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/states/isNavigationMenuInEditModeState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { filterWorkspaceNavigationMenuItems } from '@/navigation-menu-item/utils/filterWorkspaceNavigationMenuItems';
import { prefetchNavigationMenuItemsState } from '@/prefetch/states/prefetchNavigationMenuItemsState';

export const useNavigationMenuEditModeActions = () => {
  const setIsNavigationMenuInEditMode = useSetRecoilState(
    isNavigationMenuInEditModeState,
  );
  const setNavigationMenuItemsDraft = useSetRecoilState(
    navigationMenuItemsDraftState,
  );
  const setSelectedNavigationMenuItem = useSetRecoilState(
    selectedNavigationMenuItemInEditModeState,
  );

  const enterEditMode = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const prefetchNavigationMenuItems = snapshot
          .getLoadable(prefetchNavigationMenuItemsState)
          .getValue();

        const workspaceNavigationMenuItems = filterWorkspaceNavigationMenuItems(
          prefetchNavigationMenuItems,
        );

        set(navigationMenuItemsDraftState, workspaceNavigationMenuItems);
        set(isNavigationMenuInEditModeState, true);
      },
    [],
  );

  const cancelEditMode = () => {
    setNavigationMenuItemsDraft(null);
    setSelectedNavigationMenuItem(null);
    setIsNavigationMenuInEditMode(false);
  };

  return { enterEditMode, cancelEditMode };
};
