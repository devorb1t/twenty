import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { CommandMenuSubViewWithSearch } from '@/command-menu/components/CommandMenuSubViewWithSearch';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useNavigationMenuItemEditFolderData } from '@/command-menu/pages/navigation-menu-item/hooks/useNavigationMenuItemEditFolderData';
import { useNavigationMenuItemEditSubView } from '@/command-menu/pages/navigation-menu-item/hooks/useNavigationMenuItemEditSubView';
import { useSelectedNavigationMenuItemEditData } from '@/command-menu/pages/navigation-menu-item/hooks/useSelectedNavigationMenuItemEditData';
import { useNavigationMenuObjectMetadataFromDraft } from '@/navigation-menu-item/hooks/useNavigationMenuObjectMetadataFromDraft';
import { useUpdateNavigationMenuItemsDraft } from '@/navigation-menu-item/hooks/useUpdateNavigationMenuItemsDraft';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { type View } from '@/views/types/View';
import { ViewKey } from '@/views/types/ViewKey';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

type CommandMenuEditViewPickerSubViewProps = {
  selectedObjectMetadataIdForViewEdit: string | null;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onBack: () => void;
  onClearObjectMetadataForViewEdit: () => void;
};

export const CommandMenuEditViewPickerSubView = ({
  selectedObjectMetadataIdForViewEdit,
  searchValue,
  onSearchChange,
  onBack,
  onClearObjectMetadataForViewEdit,
}: CommandMenuEditViewPickerSubViewProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { closeCommandMenu } = useCommandMenu();
  const { clearSubView } = useNavigationMenuItemEditSubView();
  const { updateViewInDraft } = useUpdateNavigationMenuItemsDraft();
  const { currentDraft } = useNavigationMenuItemEditFolderData();
  const { objectMetadataItems } = useObjectMetadataItems();
  const selectedNavigationMenuItemInEditMode = useRecoilValue(
    selectedNavigationMenuItemInEditModeState,
  );
  const { selectedItemType, selectedItemObjectMetadata } =
    useSelectedNavigationMenuItemEditData();
  const { views } = useNavigationMenuObjectMetadataFromDraft(currentDraft);

  const selectedItemObjectMetadataId =
    selectedItemType === 'objectView'
      ? selectedItemObjectMetadata?.id
      : undefined;

  const viewIdsInOtherSidebarItems = new Set(
    currentDraft.flatMap((item) =>
      isDefined(item.viewId) &&
      (selectedNavigationMenuItemInEditMode === undefined ||
        item.id !== selectedNavigationMenuItemInEditMode)
        ? [item.viewId]
        : [],
    ),
  );

  const viewPickerObjectMetadataId = isDefined(
    selectedObjectMetadataIdForViewEdit,
  )
    ? selectedObjectMetadataIdForViewEdit
    : selectedItemObjectMetadataId;

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

  const selectedObjectForViewEdit = isDefined(
    selectedObjectMetadataIdForViewEdit,
  )
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

  const handleSelectView = (view: View) => {
    if (isDefined(selectedNavigationMenuItemInEditMode)) {
      updateViewInDraft(selectedNavigationMenuItemInEditMode, view);
      onClearObjectMetadataForViewEdit();
      clearSubView();
      closeCommandMenu();
    }
  };

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
              onEnter={() => handleSelectView(view)}
            >
              <CommandMenuItem
                Icon={getIcon(view.icon)}
                label={view.name}
                id={view.id}
                onClick={() => handleSelectView(view)}
              />
            </SelectableListItem>
          ))}
        </CommandGroup>
      </CommandMenuList>
    </CommandMenuSubViewWithSearch>
  );
};
