import { useLingui } from '@lingui/react/macro';
import { IconSettings } from 'twenty-ui/display';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { CommandMenuSubViewWithSearch } from '@/command-menu/components/CommandMenuSubViewWithSearch';
import { CommandMenuSelectObjectForEditMenuItem } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuSelectObjectForEditMenuItem';
import { CommandMenuSelectObjectForViewMenuItem } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuSelectObjectForViewMenuItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

type CommandMenuEditObjectPickerSubViewProps = {
  objects: ObjectMetadataItem[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onBack: () => void;
  onOpenSystemPicker: () => void;
  isViewItem: boolean;
  onSelectObjectForEdit: (
    objectMetadataItem: ObjectMetadataItem,
    defaultViewId: string,
  ) => void;
  onSelectObjectForViewEdit: (objectMetadataItem: ObjectMetadataItem) => void;
};

export const CommandMenuEditObjectPickerSubView = ({
  objects,
  searchValue,
  onSearchChange,
  onBack,
  onOpenSystemPicker,
  isViewItem,
  onSelectObjectForEdit,
  onSelectObjectForViewEdit,
}: CommandMenuEditObjectPickerSubViewProps) => {
  const { t } = useLingui();
  const filteredObjects = filterBySearchQuery({
    items: objects,
    searchQuery: searchValue,
    getSearchableValues: (item) => [item.labelPlural],
  });
  const selectableItemIds =
    filteredObjects.length > 0
      ? [...filteredObjects.map((item) => item.id), 'system']
      : ['system'];

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
      >
        <CommandGroup heading={t`Objects`}>
          {filteredObjects.map((objectMetadataItem) =>
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
