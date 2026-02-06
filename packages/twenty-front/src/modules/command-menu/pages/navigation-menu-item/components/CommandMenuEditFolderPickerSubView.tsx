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

const getDescendantFolderIds = (
  folderId: string,
  allFolders: FolderOption[],
): Set<string> =>
  allFolders.reduce<Set<string>>((acc, folder) => {
    if (folder.folderId !== folderId) {
      return acc;
    }

    acc.add(folder.id);
    getDescendantFolderIds(folder.id, allFolders).forEach((id) => acc.add(id));
    return acc;
  }, new Set());

const excludeCurrentFolder = <T extends { id: string }>(
  folders: T[],
  currentFolderId: string | null,
): T[] =>
  !isDefined(currentFolderId)
    ? folders
    : folders.filter((folder) => folder.id !== currentFolderId);

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

  const descendantFolderIds =
    isFolderItem && isDefined(selectedFolderId)
      ? getDescendantFolderIds(selectedFolderId, allFolders)
      : new Set<string>();

  const includeNoFolderOption =
    (isFolderItem && isDefined(selectedFolderId)) ||
    (isLinkItem && isDefined(currentFolderId));

  const folders =
    includeNoFolderOption && isFolderItem && isDefined(selectedFolderId)
      ? allFolders.filter(
          (folder) =>
            folder.id !== selectedFolderId &&
            !descendantFolderIds.has(folder.id),
        )
      : excludeCurrentFolder(allFolders, currentFolderId);

  const foldersToShow = includeNoFolderOption
    ? folders
    : excludeCurrentFolder(workspaceFolders, currentFolderId);

  const filteredFolders = filterBySearchQuery({
    items: foldersToShow,
    searchQuery: searchValue,
    getSearchableValues: (folder) => [folder.name],
  });
  const isEmpty = filteredFolders.length === 0 && !includeNoFolderOption;
  const selectableItemIds = [
    ...(includeNoFolderOption ? ['no-folder'] : []),
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
          {includeNoFolderOption && (
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
