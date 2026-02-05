import { useLingui } from '@lingui/react/macro';
import { IconSettings } from 'twenty-ui/display';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { CommandMenuSubViewWithSearch } from '@/command-menu/components/CommandMenuSubViewWithSearch';
import { CommandMenuSelectObjectForViewMenuItem } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuSelectObjectForViewMenuItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

type CommandMenuNewSidebarItemViewObjectPickerSubViewProps = {
  objects: ObjectMetadataItem[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onBack: () => void;
  onOpenSystemPicker: () => void;
  onSelectObject: (objectMetadataItem: ObjectMetadataItem) => void;
};

export const CommandMenuNewSidebarItemViewObjectPickerSubView = ({
  objects,
  searchValue,
  onSearchChange,
  onBack,
  onOpenSystemPicker,
  onSelectObject,
}: CommandMenuNewSidebarItemViewObjectPickerSubViewProps) => {
  const { t } = useLingui();
  const filteredObjectMetadataItems = filterBySearchQuery({
    items: objects,
    searchQuery: searchValue,
    getSearchableValues: (item) => [item.labelPlural],
  });
  const isEmpty = filteredObjectMetadataItems.length === 0;
  const selectableItemIds = isEmpty
    ? ['system']
    : [...filteredObjectMetadataItems.map((item) => item.id), 'system'];
  const noResultsText =
    searchValue.trim().length > 0
      ? t`No results found`
      : t`No objects with views found`;

  return (
    <CommandMenuSubViewWithSearch
      backBarTitle={t`Pick an object`}
      onBack={onBack}
      searchPlaceholder={t`Search an object...`}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
    >
      <CommandMenuList
        commandGroups={[]}
        selectableItemIds={selectableItemIds}
        noResults={isEmpty}
        noResultsText={noResultsText}
      >
        <CommandGroup heading={t`Objects`}>
          {filteredObjectMetadataItems.map((objectMetadataItem) => (
            <CommandMenuSelectObjectForViewMenuItem
              key={objectMetadataItem.id}
              objectMetadataItem={objectMetadataItem}
              onSelect={onSelectObject}
            />
          ))}
          <SelectableListItem itemId="system" onEnter={onOpenSystemPicker}>
            <CommandMenuItem
              Icon={IconSettings}
              label={t`System objects`}
              id="system"
              hasSubMenu={true}
              onClick={onOpenSystemPicker}
            />
          </SelectableListItem>
        </CommandGroup>
      </CommandMenuList>
    </CommandMenuSubViewWithSearch>
  );
};
