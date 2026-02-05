import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { IconFolder } from 'twenty-ui/display';

import { CommandMenuNavigationMenuItemIcon } from '@/command-menu/components/CommandMenuNavigationMenuItemIcon';
import { CommandMenuPageInfoLayout } from '@/command-menu/components/CommandMenuPageInfoLayout';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { commandMenuShouldFocusTitleInputComponentState } from '@/command-menu/states/commandMenuShouldFocusTitleInputComponentState';
import { useFlattenedWorkspaceSectionItemsForLookup } from '@/navigation-menu-item/hooks/useFlattenedWorkspaceSectionItemsForLookup';
import { useUpdateNavigationMenuItemsDraft } from '@/navigation-menu-item/hooks/useUpdateNavigationMenuItemsDraft';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { TitleInput } from '@/ui/input/components/TitleInput';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';

export const CommandMenuFolderInfo = () => {
  const theme = useTheme();
  const { t } = useLingui();
  const commandMenuPageInfo = useRecoilValue(commandMenuPageInfoState);
  const [shouldFocusTitleInput, setShouldFocusTitleInput] =
    useRecoilComponentState(
      commandMenuShouldFocusTitleInputComponentState,
      commandMenuPageInfo.instanceId,
    );
  const selectedNavigationMenuItemInEditMode = useRecoilValue(
    selectedNavigationMenuItemInEditModeState,
  );
  const workspaceSectionItems = useFlattenedWorkspaceSectionItemsForLookup();
  const { updateFolderNameInDraft } = useUpdateNavigationMenuItemsDraft();

  const selectedFolder = workspaceSectionItems.find(
    (item) =>
      item.type === 'folder' &&
      item.id === selectedNavigationMenuItemInEditMode,
  );

  if (
    !selectedFolder ||
    selectedFolder.type !== 'folder' ||
    !selectedNavigationMenuItemInEditMode
  ) {
    return null;
  }

  const folderName = selectedFolder.folder.folderName;
  const folderId = selectedFolder.id;

  const handleChange = (text: string) => {
    updateFolderNameInDraft(folderId, text);
  };

  const saveFolderName = () => {
    const trimmed = folderName.trim();
    const finalName = trimmed.length > 0 ? trimmed : t`New folder`;

    if (finalName !== folderName) {
      updateFolderNameInDraft(folderId, finalName);
    }
  };

  return (
    <CommandMenuPageInfoLayout
      icon={
        <CommandMenuNavigationMenuItemIcon colorKey="folder">
          <IconFolder
            size={theme.spacing(3)}
            color={theme.grayScale.gray1}
            stroke={theme.icon.stroke.md}
          />
        </CommandMenuNavigationMenuItemIcon>
      }
      title={
        <TitleInput
          instanceId={`folder-name-${folderId}`}
          sizeVariant="sm"
          value={folderName}
          onChange={handleChange}
          placeholder={t`Folder name`}
          onEnter={saveFolderName}
          onEscape={saveFolderName}
          onClickOutside={saveFolderName}
          onTab={saveFolderName}
          onShiftTab={saveFolderName}
          shouldFocus={shouldFocusTitleInput}
          onFocus={() => setShouldFocusTitleInput(false)}
        />
      }
    />
  );
};
