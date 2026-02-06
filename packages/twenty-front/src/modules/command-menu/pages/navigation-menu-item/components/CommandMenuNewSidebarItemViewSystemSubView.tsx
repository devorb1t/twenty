import { useLingui } from '@lingui/react/macro';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { CommandMenuSubViewWithSearch } from '@/command-menu/components/CommandMenuSubViewWithSearch';
import { useFilteredPickerItems } from '@/command-menu/hooks/useFilteredPickerItems';
import { CommandMenuSelectObjectForViewMenuItem } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuSelectObjectForViewMenuItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

type CommandMenuNewSidebarItemViewSystemSubViewProps = {
  systemObjects: ObjectMetadataItem[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onBack: () => void;
  onSelectObject: (objectMetadataItem: ObjectMetadataItem) => void;
};

export const CommandMenuNewSidebarItemViewSystemSubView = ({
  systemObjects,
  searchValue,
  onSearchChange,
  onBack,
  onSelectObject,
}: CommandMenuNewSidebarItemViewSystemSubViewProps) => {
  const { t } = useLingui();
  const {
    filteredItems: filteredSystemObjectMetadataItems,
    selectableItemIds,
    isEmpty,
    hasSearchQuery,
  } = useFilteredPickerItems({
    items: systemObjects,
    searchQuery: searchValue,
    getSearchableValues: (item) => [item.labelPlural],
  });
  const noResultsText = hasSearchQuery
    ? t`No results found`
    : t`No system objects with views found`;

  return (
    <CommandMenuSubViewWithSearch
      backBarTitle={t`System objects`}
      onBack={onBack}
      searchPlaceholder={t`Search a system object...`}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
    >
      <CommandMenuList
        commandGroups={[]}
        selectableItemIds={selectableItemIds}
        noResults={isEmpty}
        noResultsText={noResultsText}
      >
        <CommandGroup heading={t`System objects`}>
          {filteredSystemObjectMetadataItems.map((objectMetadataItem) => (
            <CommandMenuSelectObjectForViewMenuItem
              key={objectMetadataItem.id}
              objectMetadataItem={objectMetadataItem}
              onSelect={onSelectObject}
            />
          ))}
        </CommandGroup>
      </CommandMenuList>
    </CommandMenuSubViewWithSearch>
  );
};
