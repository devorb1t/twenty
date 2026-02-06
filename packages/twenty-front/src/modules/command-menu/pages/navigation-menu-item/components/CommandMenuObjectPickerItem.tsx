import { useIcons } from 'twenty-ui/display';
import { isDefined } from 'twenty-shared/utils';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuObjectMenuItem } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuObjectMenuItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type CommandMenuObjectPickerItemProps = {
  objectMetadataItem: ObjectMetadataItem;
  isViewItem: boolean;
  onSelectObjectForViewEdit?: (objectMetadataItem: ObjectMetadataItem) => void;
  onChangeObject: (
    objectMetadataItem: ObjectMetadataItem,
    defaultViewId: string,
  ) => void;
  objectMenuItemVariant?: 'add' | 'edit';
};

export const CommandMenuObjectPickerItem = ({
  objectMetadataItem,
  isViewItem,
  onSelectObjectForViewEdit,
  onChangeObject,
  objectMenuItemVariant = 'edit',
}: CommandMenuObjectPickerItemProps) => {
  const { getIcon } = useIcons();

  if (isViewItem && isDefined(onSelectObjectForViewEdit)) {
    return (
      <SelectableListItem
        itemId={objectMetadataItem.id}
        onEnter={() => onSelectObjectForViewEdit(objectMetadataItem)}
      >
        <CommandMenuItem
          Icon={getIcon(objectMetadataItem.icon)}
          label={objectMetadataItem.labelPlural}
          id={objectMetadataItem.id}
          onClick={() => onSelectObjectForViewEdit(objectMetadataItem)}
        />
      </SelectableListItem>
    );
  }

  return (
    <CommandMenuObjectMenuItem
      objectMetadataItem={objectMetadataItem}
      onSelect={onChangeObject}
      variant={objectMenuItemVariant}
    />
  );
};
