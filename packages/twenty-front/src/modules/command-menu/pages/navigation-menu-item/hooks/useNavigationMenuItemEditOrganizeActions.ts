import { useLingui } from '@lingui/react/macro';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/display';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useNavigationMenuItemMoveRemove } from '@/navigation-menu-item/hooks/useNavigationMenuItemMoveRemove';
import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/hooks/useNavigationMenuItemsDraftState';
import { useWorkspaceSectionItems } from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { addMenuItemInsertionContextState } from '@/navigation-menu-item/states/addMenuItemInsertionContextState';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';

import { type OrganizeActionsProps } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditOrganizeActions';

export const useNavigationMenuItemEditOrganizeActions =
  (): OrganizeActionsProps => {
    const { t } = useLingui();
    const { closeCommandMenu } = useCommandMenu();
    const { navigateCommandMenu } = useNavigateCommandMenu();
    const selectedNavigationMenuItemInEditMode = useRecoilValue(
      selectedNavigationMenuItemInEditModeState,
    );
    const setSelectedNavigationMenuItemInEditMode = useSetRecoilState(
      selectedNavigationMenuItemInEditModeState,
    );
    const setAddMenuItemInsertionContext = useSetRecoilState(
      addMenuItemInsertionContextState,
    );
    const { workspaceNavigationMenuItems } = useNavigationMenuItemsDraftState();
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

    const handleAddBefore = () => {
      if (!isDefined(selectedItem)) return;
      const targetFolderId = selectedItem.folderId ?? null;
      const itemsInFolder = workspaceNavigationMenuItems.filter(
        (item) =>
          (item.folderId ?? null) === targetFolderId &&
          !isDefined(item.userWorkspaceId),
      );
      const selectedIndexInFolder = itemsInFolder.findIndex(
        (item) => item.id === selectedItem.id,
      );
      if (selectedIndexInFolder < 0) return;
      setAddMenuItemInsertionContext({
        targetFolderId,
        targetIndex: selectedIndexInFolder,
      });
      navigateCommandMenu({
        page: CommandMenuPages.NavigationMenuAddItem,
        pageTitle: t`New sidebar item`,
        pageIcon: IconPlus,
        resetNavigationStack: true,
      });
    };

    const handleAddAfter = () => {
      if (!isDefined(selectedItem)) return;
      const targetFolderId = selectedItem.folderId ?? null;
      const itemsInFolder = workspaceNavigationMenuItems.filter(
        (item) =>
          (item.folderId ?? null) === targetFolderId &&
          !isDefined(item.userWorkspaceId),
      );
      const selectedIndexInFolder = itemsInFolder.findIndex(
        (item) => item.id === selectedItem.id,
      );
      if (selectedIndexInFolder < 0) return;
      setAddMenuItemInsertionContext({
        targetFolderId,
        targetIndex: selectedIndexInFolder + 1,
      });
      navigateCommandMenu({
        page: CommandMenuPages.NavigationMenuAddItem,
        pageTitle: t`New sidebar item`,
        pageIcon: IconPlus,
        resetNavigationStack: true,
      });
    };

    return {
      canMoveUp,
      canMoveDown,
      onMoveUp: handleMoveUp,
      onMoveDown: handleMoveDown,
      onRemove: handleRemove,
      onAddBefore: handleAddBefore,
      onAddAfter: handleAddAfter,
    };
  };
