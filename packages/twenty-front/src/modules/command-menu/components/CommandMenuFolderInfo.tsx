import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { IconFolder } from 'twenty-ui/display';

import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { commandMenuShouldFocusTitleInputComponentState } from '@/command-menu/states/commandMenuShouldFocusTitleInputComponentState';
import { useUpdateNavigationMenuItemsDraft } from '@/navigation-menu-item/hooks/useUpdateNavigationMenuItemsDraft';
import { getNavigationMenuItemIconColors } from '@/navigation-menu-item/utils/getNavigationMenuItemIconColors';
import {
  type WorkspaceSectionItem,
  useWorkspaceSectionItems,
} from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { TitleInput } from '@/ui/input/components/TitleInput';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { CommandMenuPageInfoLayout } from '@/command-menu/components/CommandMenuPageInfoLayout';

const StyledFolderIcon = styled.div`
  align-items: center;
  background-color: ${({ theme }) =>
    getNavigationMenuItemIconColors(theme).folder};
  border-radius: ${({ theme }) => theme.border.radius.xs};
  display: flex;
  height: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  width: ${({ theme }) => theme.spacing(4)};
`;

const getWorkspaceSectionItemId = (item: WorkspaceSectionItem): string =>
  item.type === 'folder' ? item.folder.folderId : item.navigationMenuItem.id;

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
  const workspaceSectionItems = useWorkspaceSectionItems();
  const { updateFolderNameInDraft } = useUpdateNavigationMenuItemsDraft();

  const selectedFolder = workspaceSectionItems.find(
    (item) =>
      item.type === 'folder' &&
      getWorkspaceSectionItemId(item) === selectedNavigationMenuItemInEditMode,
  );

  if (
    !selectedFolder ||
    selectedFolder.type !== 'folder' ||
    !selectedNavigationMenuItemInEditMode
  ) {
    return null;
  }

  const folderName = selectedFolder.folder.folderName;
  const folderId = selectedFolder.folder.folderId;

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
        <StyledFolderIcon>
          <IconFolder
            size={theme.spacing(3)}
            color={theme.grayScale.gray1}
            stroke={theme.icon.stroke.md}
          />
        </StyledFolderIcon>
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
