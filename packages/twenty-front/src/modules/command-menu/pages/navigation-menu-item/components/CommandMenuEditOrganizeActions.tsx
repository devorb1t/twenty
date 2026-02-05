import { useLingui } from '@lingui/react/macro';
import {
  IconChevronDown,
  IconChevronUp,
  IconFolder,
  IconTrash,
} from 'twenty-ui/display';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type CommandMenuEditOrganizeActionsProps = {
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  showMoveToFolder?: boolean;
  onMoveToFolder?: () => void;
  moveToFolderHasSubMenu?: boolean;
};

export const CommandMenuEditOrganizeActions = ({
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onRemove,
  showMoveToFolder = false,
  onMoveToFolder,
  moveToFolderHasSubMenu = false,
}: CommandMenuEditOrganizeActionsProps) => {
  const { t } = useLingui();

  return (
    <CommandGroup heading={t`Organize`}>
      <SelectableListItem
        itemId="move-up"
        onEnter={canMoveUp ? onMoveUp : undefined}
      >
        <CommandMenuItem
          Icon={IconChevronUp}
          label={t`Move up`}
          id="move-up"
          onClick={onMoveUp}
          disabled={!canMoveUp}
        />
      </SelectableListItem>
      <SelectableListItem
        itemId="move-down"
        onEnter={canMoveDown ? onMoveDown : undefined}
      >
        <CommandMenuItem
          Icon={IconChevronDown}
          label={t`Move down`}
          id="move-down"
          onClick={onMoveDown}
          disabled={!canMoveDown}
        />
      </SelectableListItem>
      {showMoveToFolder && onMoveToFolder && (
        <SelectableListItem itemId="move-to-folder" onEnter={onMoveToFolder}>
          <CommandMenuItem
            Icon={IconFolder}
            label={t`Move to folder`}
            id="move-to-folder"
            hasSubMenu={moveToFolderHasSubMenu}
            onClick={onMoveToFolder}
          />
        </SelectableListItem>
      )}
      <SelectableListItem itemId="remove" onEnter={onRemove}>
        <CommandMenuItem
          Icon={IconTrash}
          label={t`Remove from sidebar`}
          id="remove"
          onClick={onRemove}
        />
      </SelectableListItem>
    </CommandGroup>
  );
};
