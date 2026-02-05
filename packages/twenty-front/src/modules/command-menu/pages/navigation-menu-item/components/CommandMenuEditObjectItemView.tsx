import { useLingui } from '@lingui/react/macro';
import { useIcons } from 'twenty-ui/display';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { CommandMenuEditOrganizeActions } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditOrganizeActions';
import type { WorkspaceSectionItem } from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { useGetStandardObjectIcon } from '@/object-metadata/hooks/useGetStandardObjectIcon';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type ObjectViewItem = WorkspaceSectionItem & { type: 'objectView' };

type CommandMenuEditObjectItemViewProps = {
  selectedItem: ObjectViewItem;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onOpenObjectPicker: () => void;
  onOpenFolderPicker: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
};

export const CommandMenuEditObjectItemView = ({
  selectedItem,
  canMoveUp,
  canMoveDown,
  onOpenObjectPicker,
  onOpenFolderPicker,
  onMoveUp,
  onMoveDown,
  onRemove,
}: CommandMenuEditObjectItemViewProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const objectNameSingular = selectedItem.objectMetadataItem.nameSingular;
  const objectIcon = selectedItem.objectMetadataItem.icon ?? 'IconCube';
  const selectedItemLabel = selectedItem.objectMetadataItem.labelPlural;
  const { Icon: StandardObjectIcon } =
    useGetStandardObjectIcon(objectNameSingular);
  const Icon = StandardObjectIcon ?? getIcon(objectIcon);

  const selectableItemIds = [
    'object',
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
            Icon={Icon}
            label={t`Object`}
            description={selectedItemLabel ?? undefined}
            contextualTextPosition="right"
            hasSubMenu={true}
            id="object"
            onClick={onOpenObjectPicker}
          />
        </SelectableListItem>
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
