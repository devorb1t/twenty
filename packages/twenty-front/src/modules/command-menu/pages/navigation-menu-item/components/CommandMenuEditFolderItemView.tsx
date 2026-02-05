import { useLingui } from '@lingui/react/macro';
import { IconApps, IconRefresh } from 'twenty-ui/display';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { CommandMenuEditOrganizeActions } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditOrganizeActions';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type CommandMenuEditFolderItemViewProps = {
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
};

export const CommandMenuEditFolderItemView = ({
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onRemove,
}: CommandMenuEditFolderItemViewProps) => {
  const { t } = useLingui();

  const selectableItemIds = [
    'move-up',
    'move-down',
    'remove',
    'standard-app',
    'reset-to-default',
  ];

  return (
    <CommandMenuList commandGroups={[]} selectableItemIds={selectableItemIds}>
      <CommandMenuEditOrganizeActions
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onRemove={onRemove}
      />
      <CommandGroup heading={t`Owner`}>
        <SelectableListItem itemId="standard-app" onEnter={() => {}}>
          <CommandMenuItem
            Icon={IconApps}
            label={t`Standard app`}
            id="standard-app"
            disabled={true}
            onClick={() => {}}
          />
        </SelectableListItem>
        <SelectableListItem itemId="reset-to-default" onEnter={() => {}}>
          <CommandMenuItem
            Icon={IconRefresh}
            label={t`Reset to default`}
            id="reset-to-default"
            disabled={true}
            onClick={() => {}}
          />
        </SelectableListItem>
      </CommandGroup>
    </CommandMenuList>
  );
};
