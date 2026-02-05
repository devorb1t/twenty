import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useIcons } from 'twenty-ui/display';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItemWithAddToNavigationDrag } from '@/command-menu/components/CommandMenuItemWithAddToNavigationDrag';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { CommandMenuSubViewWithSearch } from '@/command-menu/components/CommandMenuSubViewWithSearch';
import type { AddToNavigationDragPayload } from '@/navigation-menu-item/types/add-to-navigation-drag-payload';
import { useNavigationMenuObjectMetadataFromDraft } from '@/navigation-menu-item/hooks/useNavigationMenuObjectMetadataFromDraft';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { type View } from '@/views/types/View';
import { ViewKey } from '@/views/types/ViewKey';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

type CommandMenuNewSidebarItemViewPickerSubViewProps = {
  currentDraft: { id: string; viewId?: string | null }[];
  selectedObjectMetadataIdForView: string;
  objectMetadataItems: ObjectMetadataItem[];
  onBack: () => void;
  onSelectView: (view: View) => void;
};

export const CommandMenuNewSidebarItemViewPickerSubView = ({
  currentDraft,
  selectedObjectMetadataIdForView,
  objectMetadataItems,
  onBack,
  onSelectView,
}: CommandMenuNewSidebarItemViewPickerSubViewProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const [searchValue, setSearchValue] = useState('');
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

  const filteredViews = filterBySearchQuery({
    items: viewsForSelectedObject,
    searchQuery: searchValue,
    getSearchableValues: (view) => [view.name],
  });
  const selectableItemIds = filteredViews.map((view) => view.id);
  const isEmpty = filteredViews.length === 0;
  const noResultsText =
    searchValue.trim().length > 0
      ? t`No results found`
      : t`No custom views available`;

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
          {filteredViews.map((view) => {
            const ViewIcon = getIcon(view.icon);
            const viewPayload: AddToNavigationDragPayload = {
              type: 'view',
              viewId: view.id,
              label: view.name,
            };
            return (
              <SelectableListItem
                key={view.id}
                itemId={view.id}
                onEnter={() => onSelectView(view)}
              >
                <CommandMenuItemWithAddToNavigationDrag
                  Icon={ViewIcon}
                  label={view.name}
                  id={view.id}
                  onClick={() => onSelectView(view)}
                  payload={viewPayload}
                />
              </SelectableListItem>
            );
          })}
        </CommandGroup>
      </CommandMenuList>
    </CommandMenuSubViewWithSearch>
  );
};
