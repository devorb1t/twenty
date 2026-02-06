import { useLingui } from '@lingui/react/macro';
import { type IconComponent } from 'twenty-ui/display';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import {
  type OrganizeActionsProps,
  CommandMenuEditOrganizeActions,
} from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditOrganizeActions';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type CommandMenuEditObjectViewBaseProps = OrganizeActionsProps & {
  objectIcon: IconComponent;
  objectLabel: string;
  onOpenObjectPicker: () => void;
  onOpenFolderPicker: () => void;
  viewRow?: {
    icon: IconComponent;
    label: string;
    onClick: () => void;
  };
};

export const CommandMenuEditObjectViewBase = ({
  objectIcon,
  objectLabel,
  onOpenObjectPicker,
  onOpenFolderPicker,
  viewRow,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onRemove,
}: CommandMenuEditObjectViewBaseProps) => {
  const { t } = useLingui();

  const selectableItemIds = [
    'object',
    ...(viewRow ? ['view'] : []),
    'move-up',
    'move-down',
    'move-to-folder',
    'remove',
  ];

  return (
    <CommandMenuList commandGroups={[]} selectableItemIds={selectableItemIds}>
      <CommandGroup heading={t`Customize`}>
        <SelectableListItem itemId="object" onEnter={onOpenObjectPicker}>
          <CommandMenuItem
            Icon={objectIcon}
            label={t`Object`}
            description={objectLabel ?? undefined}
            contextualTextPosition="right"
            hasSubMenu={true}
            id="object"
            onClick={onOpenObjectPicker}
          />
        </SelectableListItem>
        {viewRow && (
          <SelectableListItem itemId="view" onEnter={viewRow.onClick}>
            <CommandMenuItem
              Icon={viewRow.icon}
              label={t`View`}
              description={viewRow.label ?? undefined}
              contextualTextPosition="right"
              hasSubMenu={true}
              id="view"
              onClick={viewRow.onClick}
            />
          </SelectableListItem>
        )}
      </CommandGroup>
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
