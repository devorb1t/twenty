import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { CommandMenuSubViewWithSearch } from '@/command-menu/components/CommandMenuSubViewWithSearch';
import type { WorkspaceSectionItem } from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { useNavigationMenuObjectMetadataFromDraft } from '@/navigation-menu-item/hooks/useNavigationMenuObjectMetadataFromDraft';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { type View } from '@/views/types/View';
import { ViewKey } from '@/views/types/ViewKey';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

type CommandMenuEditViewPickerSubViewProps = {
  currentDraft: { id: string; viewId?: string | null }[];
  selectedObjectMetadataIdForViewEdit: string | null;
  selectedItem: WorkspaceSectionItem | undefined;
  currentItemId: string | undefined;
  objectMetadataItems: ObjectMetadataItem[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onBack: () => void;
  onSelectView: (view: View) => void;
};

export const CommandMenuEditViewPickerSubView = ({
  currentDraft,
  selectedObjectMetadataIdForViewEdit,
  selectedItem,
  currentItemId,
  objectMetadataItems,
  searchValue,
  onSearchChange,
  onBack,
  onSelectView,
}: CommandMenuEditViewPickerSubViewProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { views } = useNavigationMenuObjectMetadataFromDraft(currentDraft);

  const viewIdsInOtherSidebarItems = new Set(
    currentDraft.flatMap((item) =>
      isDefined(item.viewId) &&
      (currentItemId === undefined || item.id !== currentItemId)
        ? [item.viewId]
        : [],
    ),
  );

  const viewPickerObjectMetadataId = isDefined(selectedObjectMetadataIdForViewEdit)
    ? selectedObjectMetadataIdForViewEdit
    : selectedItem?.type === 'objectView'
      ? selectedItem.objectMetadataItem.id
      : undefined;

  const viewsForViewPicker = viewPickerObjectMetadataId
    ? views
        .filter(
          (view) =>
            view.objectMetadataId === viewPickerObjectMetadataId &&
            view.key !== ViewKey.Index &&
            !viewIdsInOtherSidebarItems.has(view.id),
        )
        .sort((a, b) => a.position - b.position)
    : [];

  const selectedObjectForViewEdit = isDefined(selectedObjectMetadataIdForViewEdit)
    ? objectMetadataItems.find(
        (item) => item.id === selectedObjectMetadataIdForViewEdit,
      )
    : undefined;
  const backBarTitle = isDefined(selectedObjectForViewEdit)
    ? selectedObjectForViewEdit.labelPlural
    : t`Pick a view`;

  const filteredViews = filterBySearchQuery({
    items: viewsForViewPicker,
    searchQuery: searchValue,
    getSearchableValues: (view) => [view.name],
  });
  const selectableItemIds =
    filteredViews.length > 0 ? filteredViews.map((view) => view.id) : [];
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
      onSearchChange={onSearchChange}
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
              onEnter={() => onSelectView(view)}
            >
              <CommandMenuItem
                Icon={getIcon(view.icon)}
                label={view.name}
                id={view.id}
                onClick={() => onSelectView(view)}
              />
            </SelectableListItem>
          ))}
        </CommandGroup>
      </CommandMenuList>
    </CommandMenuSubViewWithSearch>
  );
};
