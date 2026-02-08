import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useIcons } from 'twenty-ui/display';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItemWithAddToNavigationDrag } from '@/command-menu/components/CommandMenuItemWithAddToNavigationDrag';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { CommandMenuSubViewWithSearch } from '@/command-menu/components/CommandMenuSubViewWithSearch';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useFilteredPickerItems } from '@/command-menu/hooks/useFilteredPickerItems';
import { useNavigationMenuItemEditFolderData } from '@/command-menu/pages/navigation-menu-item/hooks/useNavigationMenuItemEditFolderData';
import { useAddToNavigationMenuDraft } from '@/navigation-menu-item/hooks/useAddToNavigationMenuDraft';
import { useNavigationMenuObjectMetadataFromDraft } from '@/navigation-menu-item/hooks/useNavigationMenuObjectMetadataFromDraft';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { type View } from '@/views/types/View';
import { ViewKey } from '@/views/types/ViewKey';

type CommandMenuNewSidebarItemViewPickerSubViewProps = {
  selectedObjectMetadataIdForView: string;
  onBack: () => void;
};

export const CommandMenuNewSidebarItemViewPickerSubView = ({
  selectedObjectMetadataIdForView,
  onBack,
}: CommandMenuNewSidebarItemViewPickerSubViewProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const [searchValue, setSearchValue] = useState('');
  const { closeCommandMenu } = useCommandMenu();
  const { addViewToDraft } = useAddToNavigationMenuDraft();
  const { currentDraft } = useNavigationMenuItemEditFolderData();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { views, viewIdsInWorkspace } =
    useNavigationMenuObjectMetadataFromDraft(currentDraft);

  const viewsForSelectedObject = views
    .filter(
      (view) =>
        view.objectMetadataId === selectedObjectMetadataIdForView &&
        !viewIdsInWorkspace.has(view.id) &&
        view.key !== ViewKey.Index,
    )
    .sort((a, b) => a.position - b.position);

  const selectedObjectMetadataItem = objectMetadataItems.find(
    (item) => item.id === selectedObjectMetadataIdForView,
  );
  const backBarTitle =
    selectedObjectMetadataItem?.labelPlural ?? t`Pick a view`;

  const {
    filteredItems: filteredViews,
    selectableItemIds,
    isEmpty,
    hasSearchQuery,
  } = useFilteredPickerItems({
    items: viewsForSelectedObject,
    searchQuery: searchValue,
    getSearchableValues: (view) => [view.name],
  });
  const noResultsText = hasSearchQuery
    ? t`No results found`
    : t`No custom views available`;

  const handleSelectView = (view: View) => {
    addViewToDraft(view, currentDraft);
    closeCommandMenu();
  };

  return (
    <CommandMenuSubViewWithSearch
      backBarTitle={backBarTitle}
      onBack={onBack}
      searchPlaceholder={t`Search a view...`}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
    >
      <CommandMenuList
        commandGroups={[]}
        selectableItemIds={selectableItemIds}
        noResults={isEmpty}
        noResultsText={noResultsText}
      >
        <CommandGroup heading={t`Views`}>
          {filteredViews.map((view) => (
            <SelectableListItem
              key={view.id}
              itemId={view.id}
              onEnter={() => handleSelectView(view)}
            >
              <CommandMenuItemWithAddToNavigationDrag
                icon={getIcon(view.icon)}
                label={view.name}
                id={view.id}
                onClick={() => handleSelectView(view)}
                payload={{
                  type: 'view',
                  viewId: view.id,
                  label: view.name,
                }}
              />
            </SelectableListItem>
          ))}
        </CommandGroup>
      </CommandMenuList>
    </CommandMenuSubViewWithSearch>
  );
};
