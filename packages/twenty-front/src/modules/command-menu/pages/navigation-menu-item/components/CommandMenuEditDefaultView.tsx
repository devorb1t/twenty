import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { CommandMenuEditOrganizeActions } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditOrganizeActions';

type CommandMenuEditDefaultViewProps = {
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onOpenFolderPicker: () => void;
};

export const CommandMenuEditDefaultView = ({
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onRemove,
  onOpenFolderPicker,
}: CommandMenuEditDefaultViewProps) => {
  const selectableItemIds = [
    'move-up',
    'move-down',
    'move-to-folder',
    'remove',
  ];

  return (
    <CommandMenuList commandGroups={[]} selectableItemIds={selectableItemIds}>
      <CommandMenuEditOrganizeActions
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onRemove={onRemove}
        showMoveToFolder={true}
        onMoveToFolder={onOpenFolderPicker}
      />
    </CommandMenuList>
  );
};
