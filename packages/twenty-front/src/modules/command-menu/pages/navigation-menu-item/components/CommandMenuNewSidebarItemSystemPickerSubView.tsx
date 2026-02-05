import { useLingui } from '@lingui/react/macro';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { CommandMenuSubViewWithSearch } from '@/command-menu/components/CommandMenuSubViewWithSearch';
import { CommandMenuAddObjectMenuItem } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuObjectMenuItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

type CommandMenuNewSidebarItemSystemPickerSubViewProps = {
  systemObjects: ObjectMetadataItem[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onBack: () => void;
  onSelectObject: (
    objectMetadataItem: ObjectMetadataItem,
    defaultViewId: string,
  ) => void;
};

export const CommandMenuNewSidebarItemSystemPickerSubView = ({
  systemObjects,
  searchValue,
  onSearchChange,
  onBack,
  onSelectObject,
}: CommandMenuNewSidebarItemSystemPickerSubViewProps) => {
  const { t } = useLingui();
  const filteredSystemObjectMetadataItems = filterBySearchQuery({
    items: systemObjects,
    searchQuery: searchValue,
    getSearchableValues: (item) => [item.labelPlural],
  });
  const isEmpty = filteredSystemObjectMetadataItems.length === 0;
  const selectableItemIds = isEmpty
    ? []
    : filteredSystemObjectMetadataItems.map((item) => item.id);
  const noResultsText =
    searchValue.trim().length > 0
      ? t`No results found`
      : t`All system objects are already in the sidebar`;

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
            <CommandMenuAddObjectMenuItem
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
