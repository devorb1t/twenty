import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuItemWithAddToNavigationDrag } from '@/command-menu/components/CommandMenuItemWithAddToNavigationDrag';
import { coreIndexViewIdFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/coreIndexViewIdFromObjectMetadataItemFamilySelector';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type CommandMenuAddObjectMenuItemProps = {
  objectMetadataItem: ObjectMetadataItem;
  onSelect: (
    objectMetadataItem: ObjectMetadataItem,
    defaultViewId: string,
  ) => void;
};

export const CommandMenuAddObjectMenuItem = ({
  objectMetadataItem,
  onSelect,
}: CommandMenuAddObjectMenuItemProps) => {
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

  const payload = {
    type: 'object' as const,
    objectMetadataId: objectMetadataItem.id,
    defaultViewId: defaultViewId ?? '',
    label: objectMetadataItem.labelPlural,
  };

  return (
    <SelectableListItem itemId={objectMetadataItem.id} onEnter={handleClick}>
      {isDisabled ? (
        <CommandMenuItem
          Icon={Icon}
          label={objectMetadataItem.labelPlural}
          id={objectMetadataItem.id}
          onClick={handleClick}
          disabled={true}
        />
      ) : (
        <CommandMenuItemWithAddToNavigationDrag
          Icon={Icon}
          label={objectMetadataItem.labelPlural}
          id={objectMetadataItem.id}
          onClick={handleClick}
          payload={payload}
        />
      )}
    </SelectableListItem>
  );
};
