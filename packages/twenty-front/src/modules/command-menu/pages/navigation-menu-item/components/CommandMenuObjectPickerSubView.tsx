import { useLingui } from '@lingui/react/macro';
import { IconSettings } from 'twenty-ui/display';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { CommandMenuObjectPickerItem } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuObjectPickerItem';
import { CommandMenuSubViewWithSearch } from '@/command-menu/components/CommandMenuSubViewWithSearch';
import { useFilteredPickerItems } from '@/command-menu/hooks/useFilteredPickerItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type CommandMenuObjectPickerSubViewProps = {
  objects: ObjectMetadataItem[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onBack: () => void;
  onOpenSystemPicker: () => void;
  isViewItem: boolean;
  onSelectObjectForViewEdit?: (objectMetadataItem: ObjectMetadataItem) => void;
  onChangeObject: (
    objectMetadataItem: ObjectMetadataItem,
    defaultViewId: string,
  ) => void;
  objectMenuItemVariant?: 'add' | 'edit';
  emptyNoResultsText?: string;
};

export const CommandMenuObjectPickerSubView = ({
  objects,
  searchValue,
  onSearchChange,
  onBack,
  onOpenSystemPicker,
  isViewItem,
  onSelectObjectForViewEdit,
  onChangeObject,
  objectMenuItemVariant = 'edit',
  emptyNoResultsText,
}: CommandMenuObjectPickerSubViewProps) => {
  const { t } = useLingui();
  const { filteredItems, selectableItemIds, isEmpty, hasSearchQuery } =
    useFilteredPickerItems({
      items: objects,
      searchQuery: searchValue,
      getSearchableValues: (item) => [item.labelPlural],
      appendSelectableIds: ['system'],
    });

  const noResultsText = hasSearchQuery
    ? t`No results found`
    : (emptyNoResultsText ?? t`All objects are already in the sidebar`);

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
          {filteredItems.map((objectMetadataItem) => (
            <CommandMenuObjectPickerItem
              key={objectMetadataItem.id}
              objectMetadataItem={objectMetadataItem}
              isViewItem={isViewItem}
              onSelectObjectForViewEdit={onSelectObjectForViewEdit}
              onChangeObject={onChangeObject}
              objectMenuItemVariant={objectMenuItemVariant}
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
