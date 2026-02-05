import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { coreIndexViewIdFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/coreIndexViewIdFromObjectMetadataItemFamilySelector';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type CommandMenuSelectObjectForEditMenuItemProps = {
  objectMetadataItem: ObjectMetadataItem;
  onSelect: (
    objectMetadataItem: ObjectMetadataItem,
    defaultViewId: string,
  ) => void;
};

export const CommandMenuSelectObjectForEditMenuItem = ({
  objectMetadataItem,
  onSelect,
}: CommandMenuSelectObjectForEditMenuItemProps) => {
  const { getIcon } = useIcons();
  const defaultViewId = useRecoilValue(
    coreIndexViewIdFromObjectMetadataItemFamilySelector({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );
  const Icon = getIcon(objectMetadataItem.icon);
  const isDisabled = !isDefined(defaultViewId);

  const handleClick = () => {
    if (!isDisabled && isDefined(defaultViewId)) {
      onSelect(objectMetadataItem, defaultViewId);
    }
  };

  return (
    <SelectableListItem itemId={objectMetadataItem.id} onEnter={handleClick}>
      <CommandMenuItem
        Icon={Icon}
        label={objectMetadataItem.labelPlural}
        id={objectMetadataItem.id}
        onClick={handleClick}
        disabled={isDisabled}
      />
    </SelectableListItem>
  );
};
