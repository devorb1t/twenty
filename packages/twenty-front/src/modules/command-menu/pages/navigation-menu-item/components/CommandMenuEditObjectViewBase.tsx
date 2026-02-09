import {
  type OrganizeActionsProps,
  CommandMenuEditOrganizeActions,
} from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditOrganizeActions';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';

type CommandMenuEditObjectViewBaseProps = OrganizeActionsProps & {
  onOpenFolderPicker: () => void;
};

export const CommandMenuEditObjectViewBase = ({
  onOpenFolderPicker,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onRemove,
}: CommandMenuEditObjectViewBaseProps) => {
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
        showMoveToFolder
        onMoveToFolder={onOpenFolderPicker}
      />
    </CommandMenuList>
  );
};
