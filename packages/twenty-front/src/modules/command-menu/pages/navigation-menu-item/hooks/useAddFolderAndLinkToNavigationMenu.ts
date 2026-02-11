import { useLingui } from '@lingui/react/macro';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconFolder, IconLink } from 'twenty-ui/display';

import { useAddFolderToNavigationMenuDraft } from '@/navigation-menu-item/hooks/useAddFolderToNavigationMenuDraft';
import { useAddLinkToNavigationMenuDraft } from '@/navigation-menu-item/hooks/useAddLinkToNavigationMenuDraft';
import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/hooks/useNavigationMenuItemsDraftState';
import { useOpenNavigationMenuItemInCommandMenu } from '@/navigation-menu-item/hooks/useOpenNavigationMenuItemInCommandMenu';
import { addMenuItemInsertionContextState } from '@/navigation-menu-item/states/addMenuItemInsertionContextState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';

export const useAddFolderAndLinkToNavigationMenu = () => {
  const { t } = useLingui();
  const { addFolderToDraft } = useAddFolderToNavigationMenuDraft();
  const { addLinkToDraft } = useAddLinkToNavigationMenuDraft();
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsDraftState();
  const navigationMenuItemsDraft = useRecoilValue(
    navigationMenuItemsDraftState,
  );
  const setSelectedNavigationMenuItemInEditMode = useSetRecoilState(
    selectedNavigationMenuItemInEditModeState,
  );
  const { openNavigationMenuItemInCommandMenu } =
    useOpenNavigationMenuItemInCommandMenu();
  const addMenuItemInsertionContext = useRecoilValue(
    addMenuItemInsertionContextState,
  );
  const setAddMenuItemInsertionContext = useSetRecoilState(
    addMenuItemInsertionContextState,
  );

  const currentDraft = isDefined(navigationMenuItemsDraft)
    ? navigationMenuItemsDraft
    : workspaceNavigationMenuItems;

  const addAndOpenEdit = (type: 'folder' | 'link') => {
    const targetFolderId = addMenuItemInsertionContext?.targetFolderId ?? null;
    const targetIndex = addMenuItemInsertionContext?.targetIndex;

    const itemId =
      type === 'folder'
        ? addFolderToDraft(
            t`New folder`,
            currentDraft,
            targetFolderId,
            targetIndex,
          )
        : addLinkToDraft(
            t`Link label`,
            'www.example.com',
            currentDraft,
            targetFolderId,
            targetIndex,
          );

    setAddMenuItemInsertionContext(null);
    setSelectedNavigationMenuItemInEditMode(itemId);
    openNavigationMenuItemInCommandMenu({
      pageTitle: type === 'folder' ? t`Edit folder` : t`Edit link`,
      pageIcon: type === 'folder' ? IconFolder : IconLink,
      focusTitleInput: true,
    });
  };

  return {
    handleAddFolder: () => addAndOpenEdit('folder'),
    handleAddLink: () => addAndOpenEdit('link'),
  };
};
