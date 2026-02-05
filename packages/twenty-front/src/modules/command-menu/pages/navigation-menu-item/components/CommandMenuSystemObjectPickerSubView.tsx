import { useLingui } from '@lingui/react/macro';
import { Fragment, type ReactNode } from 'react';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { CommandMenuSubViewWithSearch } from '@/command-menu/components/CommandMenuSubViewWithSearch';
import { useFilteredPickerItems } from '@/command-menu/hooks/useFilteredPickerItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

type CommandMenuSystemObjectPickerSubViewProps = {
  systemObjects: ObjectMetadataItem[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onBack: () => void;
  renderObjectMenuItem: (objectMetadataItem: ObjectMetadataItem) => ReactNode;
  emptyNoResultsText?: string;
};

export const CommandMenuSystemObjectPickerSubView = ({
  systemObjects,
  searchValue,
  onSearchChange,
  onBack,
  renderObjectMenuItem,
  emptyNoResultsText,
}: CommandMenuSystemObjectPickerSubViewProps) => {
  const { t } = useLingui();
  const { filteredItems, selectableItemIds, isEmpty, hasSearchQuery } =
    useFilteredPickerItems({
      items: systemObjects,
      searchQuery: searchValue,
      getSearchableValues: (item) => [item.labelPlural],
    });

  const noResultsText = hasSearchQuery
    ? t`No results found`
    : (emptyNoResultsText ?? t`No system objects available`);

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
          {filteredItems.map((objectMetadataItem) => (
            <Fragment key={objectMetadataItem.id}>
              {renderObjectMenuItem(objectMetadataItem)}
            </Fragment>
          ))}
        </CommandGroup>
      </CommandMenuList>
    </CommandMenuSubViewWithSearch>
  );
};
