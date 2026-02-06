import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import {
  type OrganizeActionsProps,
  CommandMenuEditOrganizeActions,
} from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditOrganizeActions';
import { CommandMenuEditOwnerSection } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditOwnerSection';

type CommandMenuEditFolderItemViewProps = OrganizeActionsProps & {
  applicationId?: string | null;
};

export const CommandMenuEditFolderItemView = ({
  applicationId,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onRemove,
}: CommandMenuEditFolderItemViewProps) => {
  const selectableItemIds = ['move-up', 'move-down', 'remove'];

  return (
    <CommandMenuList commandGroups={[]} selectableItemIds={selectableItemIds}>
      <CommandMenuEditOrganizeActions
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onRemove={onRemove}
      />
      <CommandMenuEditOwnerSection applicationId={applicationId} />
    </CommandMenuList>
  );
};
