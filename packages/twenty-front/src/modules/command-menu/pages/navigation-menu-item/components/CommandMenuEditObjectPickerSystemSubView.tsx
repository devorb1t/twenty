import { useLingui } from '@lingui/react/macro';
import { IconSettings } from 'twenty-ui/display';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { CommandMenuSubViewWithSearch } from '@/command-menu/components/CommandMenuSubViewWithSearch';
import { CommandMenuSelectObjectForEditMenuItem } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuSelectObjectForEditMenuItem';
import { CommandMenuSelectObjectForViewMenuItem } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuSelectObjectForViewMenuItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

type CommandMenuEditObjectPickerSystemSubViewProps = {
  systemObjects: ObjectMetadataItem[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onBack: () => void;
  isViewItem: boolean;
  onSelectObjectForEdit: (
    objectMetadataItem: ObjectMetadataItem,
    defaultViewId: string,
  ) => void;
  onSelectObjectForViewEdit: (objectMetadataItem: ObjectMetadataItem) => void;
};

export const CommandMenuEditObjectPickerSystemSubView = ({
  systemObjects,
  searchValue,
  onSearchChange,
  onBack,
  isViewItem,
  onSelectObjectForEdit,
  onSelectObjectForViewEdit,
}: CommandMenuEditObjectPickerSystemSubViewProps) => {
  const { t } = useLingui();
  const filteredSystemObjects = filterBySearchQuery({
    items: systemObjects,
    searchQuery: searchValue,
    getSearchableValues: (item) => [item.labelPlural],
  });
  const isEmptySystem = filteredSystemObjects.length === 0;
  const selectableItemIds = isEmptySystem
    ? []
    : filteredSystemObjects.map((item) => item.id);
  const noResultsTextSystem =
    searchValue.trim().length > 0
      ? t`No results found`
      : t`No system objects available`;

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
        noResults={isEmptySystem}
        noResultsText={noResultsTextSystem}
      >
        <CommandGroup heading={t`System objects`}>
          {filteredSystemObjects.map((objectMetadataItem) =>
            isViewItem ? (
              <CommandMenuSelectObjectForViewMenuItem
                key={objectMetadataItem.id}
                objectMetadataItem={objectMetadataItem}
                onSelect={onSelectObjectForViewEdit}
              />
            ) : (
              <CommandMenuSelectObjectForEditMenuItem
                key={objectMetadataItem.id}
                objectMetadataItem={objectMetadataItem}
                onSelect={onSelectObjectForEdit}
              />
            ),
          )}
        </CommandGroup>
      </CommandMenuList>
    </CommandMenuSubViewWithSearch>
  );
};
