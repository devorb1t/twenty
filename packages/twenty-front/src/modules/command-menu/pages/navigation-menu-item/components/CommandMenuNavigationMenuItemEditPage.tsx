import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { IconChevronDown, IconChevronUp, IconTrash } from 'twenty-ui/display';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useNavigationMenuItemMoveRemove } from '@/navigation-menu-item/hooks/useNavigationMenuItemMoveRemove';
import {
  type WorkspaceSectionItem,
  useWorkspaceSectionItems,
} from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

const StyledContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledPlaceholder = styled.p`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const getWorkspaceSectionItemId = (item: WorkspaceSectionItem): string =>
  item.type === 'folder' ? item.folder.folderId : item.navigationMenuItem.id;

export const CommandMenuNavigationMenuItemEditPage = () => {
  const { t } = useLingui();
  const { closeCommandMenu } = useCommandMenu();
  const selectedNavigationMenuItemInEditMode = useRecoilValue(
    selectedNavigationMenuItemInEditModeState,
  );
  const setSelectedNavigationMenuItemInEditMode = useSetRecoilState(
    selectedNavigationMenuItemInEditModeState,
  );
  const workspaceSectionItems = useWorkspaceSectionItems();
  const { moveUp, moveDown, remove } = useNavigationMenuItemMoveRemove();

  const selectedItem = selectedNavigationMenuItemInEditMode
    ? workspaceSectionItems.find(
        (item) =>
          getWorkspaceSectionItemId(item) ===
          selectedNavigationMenuItemInEditMode,
      )
    : undefined;

  const selectedItemLabel = selectedItem
    ? selectedItem.type === 'folder'
      ? selectedItem.folder.folderName
      : selectedItem.objectMetadataItem.labelPlural
    : null;

  const selectedItemIndex = selectedNavigationMenuItemInEditMode
    ? workspaceSectionItems.findIndex(
        (item) =>
          getWorkspaceSectionItemId(item) ===
          selectedNavigationMenuItemInEditMode,
      )
    : -1;

  const canMoveUp = selectedItemIndex > 0;
  const canMoveDown =
    selectedItemIndex >= 0 &&
    selectedItemIndex < workspaceSectionItems.length - 1;

  if (!selectedNavigationMenuItemInEditMode || !selectedItemLabel) {
    return (
      <StyledContainer>
        <StyledPlaceholder>{t`Select a navigation item to edit`}</StyledPlaceholder>
      </StyledContainer>
    );
  }

  const handleMoveUp = () => {
    if (canMoveUp) {
      moveUp(selectedNavigationMenuItemInEditMode);
    }
  };

  const handleMoveDown = () => {
    if (canMoveDown) {
      moveDown(selectedNavigationMenuItemInEditMode);
    }
  };

  const handleRemove = () => {
    remove(selectedNavigationMenuItemInEditMode);
    setSelectedNavigationMenuItemInEditMode(null);
    closeCommandMenu();
  };

  return (
    <CommandMenuList
      commandGroups={[]}
      selectableItemIds={['move-up', 'move-down', 'remove']}
    >
      <CommandGroup heading={t`Actions`}>
        <SelectableListItem
          itemId="move-up"
          onEnter={canMoveUp ? handleMoveUp : undefined}
        >
          <CommandMenuItem
            Icon={IconChevronUp}
            label={t`Move up`}
            id="move-up"
            onClick={handleMoveUp}
            disabled={!canMoveUp}
          />
        </SelectableListItem>
        <SelectableListItem
          itemId="move-down"
          onEnter={canMoveDown ? handleMoveDown : undefined}
        >
          <CommandMenuItem
            Icon={IconChevronDown}
            label={t`Move down`}
            id="move-down"
            onClick={handleMoveDown}
            disabled={!canMoveDown}
          />
        </SelectableListItem>
        <SelectableListItem itemId="remove" onEnter={handleRemove}>
          <CommandMenuItem
            Icon={IconTrash}
            label={t`Remove from sidebar`}
            id="remove"
            onClick={handleRemove}
          />
        </SelectableListItem>
      </CommandGroup>
    </CommandMenuList>
  );
};
