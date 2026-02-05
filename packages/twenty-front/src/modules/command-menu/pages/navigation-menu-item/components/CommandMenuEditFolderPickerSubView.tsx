import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconFolderPlus } from 'twenty-ui/display';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { CommandMenuSubViewWithSearch } from '@/command-menu/components/CommandMenuSubViewWithSearch';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

type FolderOption = {
  id: string;
  name: string;
  folderId?: string;
};

type CommandMenuEditFolderPickerSubViewProps = {
  allFolders: FolderOption[];
  workspaceFolders: { id: string; name: string }[];
  isFolderItem: boolean;
  isLinkItem: boolean;
  selectedFolderId: string | null;
  currentFolderId: string | null;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onBack: () => void;
  onSelectFolder: (folderId: string | null) => void;
};

export const CommandMenuEditFolderPickerSubView = ({
  allFolders,
  workspaceFolders,
  isFolderItem,
  isLinkItem,
  selectedFolderId,
  currentFolderId,
  searchValue,
  onSearchChange,
  onBack,
  onSelectFolder,
}: CommandMenuEditFolderPickerSubViewProps) => {
  const { t } = useLingui();

  const descendantFolderIds = new Set<string>();
  if (isFolderItem && isDefined(selectedFolderId)) {
    const collectDescendants = (folderId: string) => {
      allFolders
        .filter((folder) => folder.folderId === folderId)
        .forEach((folder) => {
          descendantFolderIds.add(folder.id);
          collectDescendants(folder.id);
        });
    };
    collectDescendants(selectedFolderId);
  }

  const shouldIncludeNoFolderOption =
    (isFolderItem && isDefined(selectedFolderId)) ||
    (isLinkItem && isDefined(currentFolderId));
  const foldersForFolderPicker = !shouldIncludeNoFolderOption
    ? {
        folders: allFolders.filter(
          (folder) =>
            !isDefined(currentFolderId) || folder.id !== currentFolderId,
        ),
        includeNoFolderOption: false,
      }
    : isLinkItem
      ? {
          folders: allFolders.filter(
            (folder) =>
              !isDefined(currentFolderId) || folder.id !== currentFolderId,
          ),
          includeNoFolderOption: true,
        }
      : {
          folders: allFolders.filter(
            (folder) =>
              folder.id !== selectedFolderId &&
              !descendantFolderIds.has(folder.id),
          ),
          includeNoFolderOption: true,
        };

  const foldersToShow = foldersForFolderPicker.includeNoFolderOption
    ? foldersForFolderPicker.folders
    : workspaceFolders.filter(
        (folder) =>
          !isDefined(currentFolderId) || folder.id !== currentFolderId,
      );

  const filteredFolders = filterBySearchQuery({
    items: foldersToShow,
    searchQuery: searchValue,
    getSearchableValues: (folder) => [folder.name],
  });
  const isEmpty =
    filteredFolders.length === 0 &&
    !foldersForFolderPicker.includeNoFolderOption;
  const selectableItemIds = [
    ...(foldersForFolderPicker.includeNoFolderOption ? ['no-folder'] : []),
    ...(filteredFolders.length > 0 ? filteredFolders.map((f) => f.id) : []),
  ];
  const noResultsText =
    searchValue.trim().length > 0
      ? t`No results found`
      : t`No folders available`;

  return (
    <CommandMenuSubViewWithSearch
      backBarTitle={t`Move to a folder`}
      onBack={onBack}
      searchPlaceholder={t`Search a folder...`}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
    >
      <CommandMenuList
        commandGroups={[]}
        selectableItemIds={selectableItemIds}
        noResults={isEmpty}
        noResultsText={noResultsText}
      >
        <CommandGroup heading={t`Folders`}>
          {foldersForFolderPicker.includeNoFolderOption && (
            <SelectableListItem
              itemId="no-folder"
              onEnter={() => onSelectFolder(null)}
            >
              <CommandMenuItem
                label={t`No folder`}
                id="no-folder"
                onClick={() => onSelectFolder(null)}
              />
            </SelectableListItem>
          )}
          {filteredFolders.map((folder) => (
            <SelectableListItem
              key={folder.id}
              itemId={folder.id}
              onEnter={() => onSelectFolder(folder.id)}
            >
              <CommandMenuItem
                Icon={IconFolderPlus}
                label={folder.name}
                id={folder.id}
                onClick={() => onSelectFolder(folder.id)}
              />
            </SelectableListItem>
          ))}
        </CommandGroup>
      </CommandMenuList>
    </CommandMenuSubViewWithSearch>
  );
};
