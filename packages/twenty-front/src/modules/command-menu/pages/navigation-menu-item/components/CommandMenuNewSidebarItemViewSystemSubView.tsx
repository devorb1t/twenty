import { useLingui } from '@lingui/react/macro';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { CommandMenuSubViewWithSearch } from '@/command-menu/components/CommandMenuSubViewWithSearch';
import { CommandMenuSelectObjectForViewMenuItem } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuSelectObjectForViewMenuItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

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
