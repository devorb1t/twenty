import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useNavigationMenuItemMoveRemove } from '@/navigation-menu-item/hooks/useNavigationMenuItemMoveRemove';
import { useWorkspaceSectionItems } from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';

import { type OrganizeActionsProps } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditOrganizeActions';

export const useNavigationMenuItemEditOrganizeActions =
  (): OrganizeActionsProps => {
    const { closeCommandMenu } = useCommandMenu();
    const selectedNavigationMenuItemInEditMode = useRecoilValue(
      selectedNavigationMenuItemInEditModeState,
    );
    const setSelectedNavigationMenuItemInEditMode = useSetRecoilState(
      selectedNavigationMenuItemInEditModeState,
    );
    const items = useWorkspaceSectionItems();
    const { moveUp, moveDown, remove } = useNavigationMenuItemMoveRemove();

    const selectedItemIndex = selectedNavigationMenuItemInEditMode
      ? items.findIndex(
          (item) => item.id === selectedNavigationMenuItemInEditMode,
        )
      : -1;
    const selectedItem = selectedNavigationMenuItemInEditMode
      ? items.find((item) => item.id === selectedNavigationMenuItemInEditMode)
      : undefined;
    const isItemInsideFolder = isDefined(selectedItem?.folderId);
    const canMoveUp = !isItemInsideFolder && selectedItemIndex > 0;
    const canMoveDown =
      !isItemInsideFolder &&
      selectedItemIndex >= 0 &&
      selectedItemIndex < items.length - 1;

    const handleMoveUp = () => {
      if (canMoveUp && isDefined(selectedNavigationMenuItemInEditMode)) {
        moveUp(selectedNavigationMenuItemInEditMode);
      }
    };

    const handleMoveDown = () => {
      if (canMoveDown && isDefined(selectedNavigationMenuItemInEditMode)) {
        moveDown(selectedNavigationMenuItemInEditMode);
      }
    };

    const handleRemove = () => {
      if (isDefined(selectedNavigationMenuItemInEditMode)) {
        remove(selectedNavigationMenuItemInEditMode);
        setSelectedNavigationMenuItemInEditMode(null);
        closeCommandMenu();
      }
    };

    return {
      canMoveUp,
      canMoveDown,
      onMoveUp: handleMoveUp,
      onMoveDown: handleMoveDown,
      onRemove: handleRemove,
    };
  };
