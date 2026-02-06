import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import {
  type OrganizeActionsProps,
  CommandMenuEditOrganizeActions,
} from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditOrganizeActions';

type CommandMenuEditDefaultViewProps = OrganizeActionsProps & {
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
