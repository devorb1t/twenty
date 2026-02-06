import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { IconFolder } from 'twenty-ui/display';

import { CommandMenuNavigationMenuItemIcon } from '@/command-menu/components/CommandMenuNavigationMenuItemIcon';
import { CommandMenuPageInfoLayout } from '@/command-menu/components/CommandMenuPageInfoLayout';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { commandMenuShouldFocusTitleInputComponentState } from '@/command-menu/states/commandMenuShouldFocusTitleInputComponentState';
import { useUpdateNavigationMenuItemsDraft } from '@/navigation-menu-item/hooks/useUpdateNavigationMenuItemsDraft';
import { useWorkspaceSectionItems } from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { getNavigationMenuItemType } from '@/navigation-menu-item/utils/getNavigationMenuItemType';
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
  const items = useWorkspaceSectionItems();
  const { updateFolderNameInDraft } = useUpdateNavigationMenuItemsDraft();

  const selectedFolder = selectedNavigationMenuItemInEditMode
    ? items.find(
        (item) =>
          getNavigationMenuItemType(item) === 'folder' &&
          item.id === selectedNavigationMenuItemInEditMode,
      )
    : undefined;

  if (!selectedFolder) {
    return null;
  }

  const folderId = selectedFolder.id;
  const folderName = selectedFolder.name ?? t`New folder`;
  const defaultName = t`New folder`;

  const handleChange = (text: string) => {
    updateFolderNameInDraft(folderId, text);
  };

  const handleSave = () => {
    const trimmed = folderName.trim();
    const finalName = trimmed.length > 0 ? trimmed : defaultName;

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
          onEnter={handleSave}
          onEscape={handleSave}
          onClickOutside={handleSave}
          onTab={handleSave}
          onShiftTab={handleSave}
          shouldFocus={shouldFocusTitleInput}
          onFocus={() => setShouldFocusTitleInput(false)}
        />
      }
    />
  );
};
