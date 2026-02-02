import { useRecoilState, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/states/isNavigationMenuInEditModeState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { prefetchNavigationMenuItemsState } from '@/prefetch/states/prefetchNavigationMenuItemsState';

export const useNavigationMenuItemsDraftState = () => {
  const isNavigationMenuInEditMode = useRecoilValue(
    isNavigationMenuInEditModeState,
  );
  const prefetchNavigationMenuItems = useRecoilValue(
    prefetchNavigationMenuItemsState,
  );
  const [navigationMenuItemsDraft, setNavigationMenuItemsDraft] =
    useRecoilState(navigationMenuItemsDraftState);

  const workspaceNavigationMenuItemsFromPrefetch =
    prefetchNavigationMenuItems.filter(
      (item) => !isDefined(item.userWorkspaceId),
    );

  const workspaceNavigationMenuItems =
    isNavigationMenuInEditMode && isDefined(navigationMenuItemsDraft)
      ? navigationMenuItemsDraft
      : workspaceNavigationMenuItemsFromPrefetch;

  const isDirty =
    isNavigationMenuInEditMode &&
    isDefined(navigationMenuItemsDraft) &&
    !isDeeplyEqual(
      navigationMenuItemsDraft,
      workspaceNavigationMenuItemsFromPrefetch,
    );

  return {
    workspaceNavigationMenuItems,
    navigationMenuItemsDraft,
    setNavigationMenuItemsDraft,
    isDirty,
  };
};
