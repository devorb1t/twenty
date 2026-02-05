import { useIcons } from 'twenty-ui/display';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type CommandMenuSelectObjectForViewMenuItemProps = {
  objectMetadataItem: ObjectMetadataItem;
  onSelect: (objectMetadataItem: ObjectMetadataItem) => void;
};

export const CommandMenuSelectObjectForViewMenuItem = ({
  objectMetadataItem,
  onSelect,
}: CommandMenuSelectObjectForViewMenuItemProps) => {
  const { getIcon } = useIcons();
  const Icon = getIcon(objectMetadataItem.icon);

  const handleClick = () => {
    onSelect(objectMetadataItem);
  };

  return (
    <SelectableListItem itemId={objectMetadataItem.id} onEnter={handleClick}>
      <CommandMenuItem
        Icon={Icon}
        label={objectMetadataItem.labelPlural}
        id={objectMetadataItem.id}
        onClick={handleClick}
      />
    </SelectableListItem>
  );
};
