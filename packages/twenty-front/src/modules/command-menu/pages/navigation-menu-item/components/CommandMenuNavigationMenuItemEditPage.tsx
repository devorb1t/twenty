import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useMemo, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import {
  IconApps,
  IconChevronDown,
  IconChevronUp,
  IconFolder,
  IconRefresh,
  IconSettings,
  IconTrash,
  useIcons,
} from 'twenty-ui/display';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { CommandMenuSubViewWithSearch } from '@/command-menu/components/CommandMenuSubViewWithSearch';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useNavigationMenuItemMoveRemove } from '@/navigation-menu-item/hooks/useNavigationMenuItemMoveRemove';
import { useNavigationMenuItemsByFolder } from '@/navigation-menu-item/hooks/useNavigationMenuItemsByFolder';
import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/hooks/useNavigationMenuItemsDraftState';
import { useUpdateNavigationMenuItemsDraft } from '@/navigation-menu-item/hooks/useUpdateNavigationMenuItemsDraft';
import {
  type WorkspaceSectionItem,
  useWorkspaceSectionItems,
} from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { getWorkspaceSectionItemId } from '@/navigation-menu-item/utils/getWorkspaceSectionItemId';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/utils/isNavigationMenuItemFolder';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useGetStandardObjectIcon } from '@/object-metadata/hooks/useGetStandardObjectIcon';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { TextInput } from '@/ui/input/components/TextInput';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { coreViewsState } from '@/views/states/coreViewState';
import { coreIndexViewIdFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/coreIndexViewIdFromObjectMetadataItemFamilySelector';
import { type View } from '@/views/types/View';
import { ViewKey } from '@/views/types/ViewKey';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';

const StyledContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledPlaceholder = styled.p`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const isObjectNavItem = (item: WorkspaceSectionItem): boolean =>
  item.type === 'objectView' &&
  item.navigationMenuItem.viewKey === ViewKey.Index &&
  !isDefined(item.navigationMenuItem.targetRecordId);

const isViewNavItem = (item: WorkspaceSectionItem): boolean =>
  item.type === 'objectView' &&
  item.navigationMenuItem.viewKey !== ViewKey.Index &&
  isDefined(item.navigationMenuItem.viewId) &&
  !isDefined(item.navigationMenuItem.targetRecordId);

const CommandMenuSelectObjectForEditMenuItem = ({
  objectMetadataItem,
  onSelect,
}: {
  objectMetadataItem: ObjectMetadataItem;
  onSelect: (
    objectMetadataItem: ObjectMetadataItem,
    defaultViewId: string,
  ) => void;
}) => {
  const { getIcon } = useIcons();
  const defaultViewId = useRecoilValue(
    coreIndexViewIdFromObjectMetadataItemFamilySelector({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );
  const Icon = getIcon(objectMetadataItem.icon);
  const isDisabled = !isDefined(defaultViewId);

  const handleClick = () => {
    if (!isDisabled && isDefined(defaultViewId)) {
      onSelect(objectMetadataItem, defaultViewId);
    }
  };

  return (
    <SelectableListItem itemId={objectMetadataItem.id} onEnter={handleClick}>
      <CommandMenuItem
        Icon={Icon}
        label={objectMetadataItem.labelPlural}
        id={objectMetadataItem.id}
        onClick={handleClick}
        disabled={isDisabled}
      />
    </SelectableListItem>
  );
};

const CommandMenuSelectObjectForViewEditMenuItem = ({
  objectMetadataItem,
  onSelect,
}: {
  objectMetadataItem: ObjectMetadataItem;
  onSelect: (objectMetadataItem: ObjectMetadataItem) => void;
}) => {
  const { getIcon } = useIcons();
  const Icon = getIcon(objectMetadataItem.icon);

  const handleClick = () => {
    onSelect(objectMetadataItem);
  };

  return (
    <SelectableListItem itemId={objectMetadataItem.id} onEnter={handleClick}>
      <CommandMenuItem
        Icon={Icon}
        label={objectMetadataItem.labelPlural}
        id={objectMetadataItem.id}
        onClick={handleClick}
      />
    </SelectableListItem>
  );
};

export const CommandMenuNavigationMenuItemEditPage = () => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { closeCommandMenu } = useCommandMenu();
  const [editSubView, setEditSubView] = useState<
    | 'object-picker'
    | 'object-picker-system'
    | 'folder-picker'
    | 'view-picker'
    | 'folder-rename'
    | null
  >(null);
  const [
    selectedObjectMetadataIdForViewEdit,
    setSelectedObjectMetadataIdForViewEdit,
  ] = useState<string | null>(null);
  const [objectSearchInput, setObjectSearchInput] = useState('');
  const [systemObjectSearchInput, setSystemObjectSearchInput] = useState('');
  const [folderSearchInput, setFolderSearchInput] = useState('');
  const [folderRenameInput, setFolderRenameInput] = useState('');
  const [urlEditInput, setUrlEditInput] = useState('');
  const [viewSearchInput, setViewSearchInput] = useState('');

  const selectedNavigationMenuItemInEditMode = useRecoilValue(
    selectedNavigationMenuItemInEditModeState,
  );
  const setSelectedNavigationMenuItemInEditMode = useSetRecoilState(
    selectedNavigationMenuItemInEditModeState,
  );
  const workspaceSectionItems = useWorkspaceSectionItems();
  const { moveUp, moveDown, remove, moveToFolder } =
    useNavigationMenuItemMoveRemove();
  const {
    updateObjectInDraft,
    updateViewInDraft,
    updateFolderNameInDraft,
    updateLinkInDraft,
  } = useUpdateNavigationMenuItemsDraft();
  const { workspaceNavigationMenuItems, navigationMenuItemsDraft } =
    useNavigationMenuItemsDraftState();
  const { workspaceNavigationMenuItemsByFolder } =
    useNavigationMenuItemsByFolder();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();
  const coreViews = useRecoilValue(coreViewsState);

  const currentDraft = isDefined(navigationMenuItemsDraft)
    ? navigationMenuItemsDraft
    : workspaceNavigationMenuItems;

  const selectedItem = selectedNavigationMenuItemInEditMode
    ? workspaceSectionItems.find(
        (item) =>
          getWorkspaceSectionItemId(item) ===
          selectedNavigationMenuItemInEditMode,
      )
    : undefined;

  const objectNameSingularForIcon =
    selectedItem?.type === 'objectView'
      ? selectedItem.objectMetadataItem.nameSingular
      : '';
  const { Icon: StandardObjectIcon } = useGetStandardObjectIcon(
    objectNameSingularForIcon,
  );

  const selectedItemLabel = selectedItem
    ? selectedItem.type === 'folder'
      ? selectedItem.folder.folderName
      : selectedItem.type === 'link'
        ? (selectedItem.navigationMenuItem.name ?? 'Link')
        : selectedItem.objectMetadataItem.labelPlural
    : null;

  const selectedViewLabel =
    selectedItem?.type === 'objectView' && isViewNavItem(selectedItem)
      ? (selectedItem.navigationMenuItem.labelIdentifier ?? null)
      : null;

  const selectedItemIndex = selectedNavigationMenuItemInEditMode
    ? workspaceSectionItems.findIndex(
        (item) =>
          getWorkspaceSectionItemId(item) ===
          selectedNavigationMenuItemInEditMode,
      )
    : -1;

  const canMoveUp = selectedItemIndex > 0;
  const canMoveDown =
    selectedItemIndex >= 0 &&
    selectedItemIndex < workspaceSectionItems.length - 1;

  const isObjectItem =
    selectedItem !== undefined && isObjectNavItem(selectedItem);
  const isViewItem = selectedItem !== undefined && isViewNavItem(selectedItem);
  const isFolderItem =
    selectedItem !== undefined && selectedItem.type === 'folder';
  const isLinkItem = selectedItem !== undefined && selectedItem.type === 'link';

  const objectMetadataIdsWithIndexView = useMemo(() => {
    const views = coreViews.map(convertCoreViewToView);
    return new Set(
      views
        .filter((view) => view.key === ViewKey.Index)
        .map((view) => view.objectMetadataId),
    );
  }, [coreViews]);

  const objectMetadataIdsWithAnyView = useMemo(() => {
    const views = coreViews.map(convertCoreViewToView);
    return new Set(views.map((view) => view.objectMetadataId));
  }, [coreViews]);

  const objectMetadataItemsInWorkspaceIds = useMemo(() => {
    const views = coreViews.map(convertCoreViewToView);
    const ids = new Set<string>();
    for (const item of currentDraft) {
      if (isDefined(item.viewId)) {
        const view = views.find((v) => v.id === item.viewId);
        if (isDefined(view)) ids.add(view.objectMetadataId);
      }
      if (isDefined(item.targetObjectMetadataId)) {
        ids.add(item.targetObjectMetadataId);
      }
    }
    return ids;
  }, [coreViews, currentDraft]);

  const objectsForObjectPicker = useMemo(() => {
    const objects = activeNonSystemObjectMetadataItems.filter((item) =>
      objectMetadataIdsWithIndexView.has(item.id),
    );
    return objects
      .filter((item) => !objectMetadataItemsInWorkspaceIds.has(item.id))
      .sort((a, b) => a.labelPlural.localeCompare(b.labelPlural));
  }, [
    activeNonSystemObjectMetadataItems,
    objectMetadataIdsWithIndexView,
    objectMetadataItemsInWorkspaceIds,
  ]);

  const currentObjectMetadataId =
    selectedItem?.type === 'objectView'
      ? (selectedItem.navigationMenuItem.targetObjectMetadataId ?? undefined)
      : undefined;
  const objectsForObjectPickerIncludingCurrent = useMemo(() => {
    const currentObject =
      currentObjectMetadataId !== undefined
        ? objectMetadataItems.find(
            (item) => item.id === currentObjectMetadataId,
          )
        : undefined;
    const baseObjects = objectsForObjectPicker;
    if (
      currentObject !== undefined &&
      !baseObjects.some((o) => o.id === currentObject.id)
    ) {
      return [currentObject, ...baseObjects].sort((a, b) =>
        a.labelPlural.localeCompare(b.labelPlural),
      );
    }
    return baseObjects;
  }, [objectsForObjectPicker, currentObjectMetadataId, objectMetadataItems]);

  const activeSystemObjectMetadataItems = useMemo(
    () =>
      objectMetadataItems
        .filter((item) => item.isActive && item.isSystem)
        .sort((a, b) => a.labelPlural.localeCompare(b.labelPlural)),
    [objectMetadataItems],
  );

  const systemObjectsForObjectPicker = activeSystemObjectMetadataItems.filter(
    (item) =>
      objectMetadataIdsWithIndexView.has(item.id) &&
      (objectMetadataItemsInWorkspaceIds.has(item.id)
        ? item.id === currentObjectMetadataId
        : true),
  );

  const objectsForViewEditObjectPicker = useMemo(() => {
    const objects = activeNonSystemObjectMetadataItems.filter((item) =>
      objectMetadataIdsWithAnyView.has(item.id),
    );
    const currentObject =
      currentObjectMetadataId !== undefined
        ? objectMetadataItems.find(
            (item) => item.id === currentObjectMetadataId,
          )
        : undefined;
    if (
      currentObject !== undefined &&
      !objects.some((object) => object.id === currentObject.id)
    ) {
      return [currentObject, ...objects].sort((a, b) =>
        a.labelPlural.localeCompare(b.labelPlural),
      );
    }
    return objects.sort((a, b) => a.labelPlural.localeCompare(b.labelPlural));
  }, [
    activeNonSystemObjectMetadataItems,
    objectMetadataIdsWithAnyView,
    currentObjectMetadataId,
    objectMetadataItems,
  ]);

  const systemObjectsForViewEditObjectPicker =
    activeSystemObjectMetadataItems.filter((item) =>
      objectMetadataIdsWithAnyView.has(item.id),
    );

  const viewIdsInOtherSidebarItems = useMemo(() => {
    const currentItemId = selectedNavigationMenuItemInEditMode;
    return new Set(
      currentDraft
        .filter(
          (item) =>
            isDefined(item.viewId) &&
            (currentItemId === undefined || item.id !== currentItemId),
        )
        .map((item) => item.viewId as string),
    );
  }, [currentDraft, selectedNavigationMenuItemInEditMode]);

  const viewsForViewPicker = useMemo(() => {
    const objectMetadataId = isDefined(selectedObjectMetadataIdForViewEdit)
      ? selectedObjectMetadataIdForViewEdit
      : selectedItem?.type === 'objectView'
        ? selectedItem.objectMetadataItem.id
        : undefined;
    if (!objectMetadataId) return [];
    const views = coreViews.map(convertCoreViewToView);
    return views
      .filter(
        (view) =>
          view.objectMetadataId === objectMetadataId &&
          view.key !== ViewKey.Index &&
          !viewIdsInOtherSidebarItems.has(view.id),
      )
      .sort((a, b) => a.position - b.position);
  }, [
    coreViews,
    selectedItem,
    selectedObjectMetadataIdForViewEdit,
    viewIdsInOtherSidebarItems,
  ]);

  const workspaceFolders = workspaceNavigationMenuItemsByFolder.map(
    (folder) => ({
      id: folder.folderId,
      name: folder.folderName,
    }),
  );

  const foldersForFolderPicker = useMemo(() => {
    const folders =
      currentDraft?.filter(isNavigationMenuItemFolder).map((item) => ({
        id: item.id,
        name: item.name ?? 'Folder',
        folderId: item.folderId ?? undefined,
      })) ?? [];

    if (
      (!isFolderItem && !isLinkItem) ||
      !selectedNavigationMenuItemInEditMode
    ) {
      return { folders, includeNoFolderOption: false };
    }

    if (isLinkItem) {
      return {
        folders,
        includeNoFolderOption: true,
      };
    }

    const currentFolderId = selectedNavigationMenuItemInEditMode;
    const descendantFolderIds = new Set<string>();
    const collectDescendants = (folderId: string) => {
      folders
        .filter((folder) => folder.folderId === folderId)
        .forEach((folder) => {
          descendantFolderIds.add(folder.id);
          collectDescendants(folder.id);
        });
    };
    collectDescendants(currentFolderId);

    const availableFolders = folders.filter(
      (folder) =>
        folder.id !== currentFolderId && !descendantFolderIds.has(folder.id),
    );

    return {
      folders: availableFolders,
      includeNoFolderOption: true,
    };
  }, [
    currentDraft,
    isFolderItem,
    isLinkItem,
    selectedNavigationMenuItemInEditMode,
  ]);

  if (!selectedNavigationMenuItemInEditMode || !selectedItemLabel) {
    return (
      <StyledContainer>
        <StyledPlaceholder>{t`Select a navigation item to edit`}</StyledPlaceholder>
      </StyledContainer>
    );
  }

  const handleMoveUp = () => {
    if (canMoveUp) {
      moveUp(selectedNavigationMenuItemInEditMode);
    }
  };

  const handleMoveDown = () => {
    if (canMoveDown) {
      moveDown(selectedNavigationMenuItemInEditMode);
    }
  };

  const handleRemove = () => {
    remove(selectedNavigationMenuItemInEditMode);
    setSelectedNavigationMenuItemInEditMode(null);
    closeCommandMenu();
  };

  const handleChangeObject = (
    objectMetadataItem: ObjectMetadataItem,
    defaultViewId: string,
  ) => {
    updateObjectInDraft(
      selectedNavigationMenuItemInEditMode,
      objectMetadataItem,
      defaultViewId,
    );
    setEditSubView(null);
    closeCommandMenu();
  };

  const handleSelectObjectForViewEdit = (
    objectMetadataItem: ObjectMetadataItem,
  ) => {
    setSelectedObjectMetadataIdForViewEdit(objectMetadataItem.id);
    setEditSubView('view-picker');
  };

  const handleMoveToFolder = (folderId: string | null) => {
    moveToFolder(selectedNavigationMenuItemInEditMode, folderId);
    setEditSubView(null);
    closeCommandMenu();
  };

  const handleChangeView = (view: View) => {
    updateViewInDraft(selectedNavigationMenuItemInEditMode, view);
    setSelectedObjectMetadataIdForViewEdit(null);
    setEditSubView(null);
    closeCommandMenu();
  };

  const handleBackFromViewPicker = () => {
    if (isDefined(selectedObjectMetadataIdForViewEdit)) {
      setSelectedObjectMetadataIdForViewEdit(null);
      setEditSubView('object-picker');
    } else {
      setEditSubView(null);
    }
  };

  const handleRenameFolder = () => {
    const trimmed = folderRenameInput.trim();
    if (trimmed.length > 0 && isFolderItem && selectedItem?.type === 'folder') {
      updateFolderNameInDraft(selectedItem.folder.folderId, trimmed);
      setEditSubView(null);
      setFolderRenameInput('');
      closeCommandMenu();
    }
  };

  if (editSubView === 'folder-picker') {
    const foldersToShow = foldersForFolderPicker.includeNoFolderOption
      ? foldersForFolderPicker.folders
      : workspaceFolders;
    const filteredFolders = foldersToShow.filter((folder) =>
      folder.name
        .toLowerCase()
        .includes(folderSearchInput.toLowerCase().trim()),
    );
    const selectableItemIds = [
      ...(foldersForFolderPicker.includeNoFolderOption ? ['no-folder'] : []),
      ...(filteredFolders.length > 0 ? filteredFolders.map((f) => f.id) : []),
    ];
    if (selectableItemIds.length === 0) {
      selectableItemIds.push('empty');
    }

    return (
      <CommandMenuSubViewWithSearch
        backBarTitle={t`Move to a folder`}
        onBack={() => setEditSubView(null)}
        searchPlaceholder={t`Search a folder...`}
        searchValue={folderSearchInput}
        onSearchChange={setFolderSearchInput}
      >
        <CommandMenuList
          commandGroups={[]}
          selectableItemIds={selectableItemIds}
        >
          <CommandGroup heading={t`Folders`}>
            {foldersForFolderPicker.includeNoFolderOption && (
              <SelectableListItem
                itemId="no-folder"
                onEnter={() => handleMoveToFolder(null)}
              >
                <CommandMenuItem
                  label={t`No folder`}
                  id="no-folder"
                  onClick={() => handleMoveToFolder(null)}
                />
              </SelectableListItem>
            )}
            {filteredFolders.length === 0 &&
            !foldersForFolderPicker.includeNoFolderOption ? (
              <SelectableListItem itemId="empty" onEnter={() => {}}>
                <CommandMenuItem
                  label={
                    folderSearchInput.trim().length > 0
                      ? t`No results found`
                      : t`No folders available`
                  }
                  id="empty"
                  disabled={true}
                />
              </SelectableListItem>
            ) : (
              filteredFolders.map((folder) => (
                <SelectableListItem
                  key={folder.id}
                  itemId={folder.id}
                  onEnter={() => handleMoveToFolder(folder.id)}
                >
                  <CommandMenuItem
                    Icon={IconFolder}
                    label={folder.name}
                    id={folder.id}
                    onClick={() => handleMoveToFolder(folder.id)}
                  />
                </SelectableListItem>
              ))
            )}
          </CommandGroup>
        </CommandMenuList>
      </CommandMenuSubViewWithSearch>
    );
  }

  if (editSubView === 'object-picker-system') {
    const systemObjects = isViewItem
      ? systemObjectsForViewEditObjectPicker
      : systemObjectsForObjectPicker;
    const filteredSystemObjects = systemObjects.filter((item) =>
      item.labelPlural
        .toLowerCase()
        .includes(systemObjectSearchInput.toLowerCase().trim()),
    );
    const selectableItemIds =
      filteredSystemObjects.length > 0
        ? filteredSystemObjects.map((item) => item.id)
        : ['empty'];

    return (
      <CommandMenuSubViewWithSearch
        backBarTitle={t`System objects`}
        onBack={() => setEditSubView('object-picker')}
        searchPlaceholder={t`Search a system object...`}
        searchValue={systemObjectSearchInput}
        onSearchChange={setSystemObjectSearchInput}
      >
        <CommandMenuList
          commandGroups={[]}
          selectableItemIds={selectableItemIds}
        >
          <CommandGroup heading={t`System objects`}>
            {filteredSystemObjects.map((objectMetadataItem) =>
              isViewItem ? (
                <CommandMenuSelectObjectForViewEditMenuItem
                  key={objectMetadataItem.id}
                  objectMetadataItem={objectMetadataItem}
                  onSelect={handleSelectObjectForViewEdit}
                />
              ) : (
                <CommandMenuSelectObjectForEditMenuItem
                  key={objectMetadataItem.id}
                  objectMetadataItem={objectMetadataItem}
                  onSelect={handleChangeObject}
                />
              ),
            )}
          </CommandGroup>
        </CommandMenuList>
      </CommandMenuSubViewWithSearch>
    );
  }

  if (editSubView === 'object-picker') {
    const objects = isViewItem
      ? objectsForViewEditObjectPicker
      : objectsForObjectPickerIncludingCurrent;
    const filteredObjects = objects.filter((item) =>
      item.labelPlural
        .toLowerCase()
        .includes(objectSearchInput.toLowerCase().trim()),
    );
    const selectableItemIds =
      filteredObjects.length > 0
        ? [...filteredObjects.map((item) => item.id), 'system']
        : ['empty', 'system'];

    return (
      <CommandMenuSubViewWithSearch
        backBarTitle={t`Pick an object`}
        onBack={() => setEditSubView(null)}
        searchPlaceholder={t`Search an object...`}
        searchValue={objectSearchInput}
        onSearchChange={setObjectSearchInput}
      >
        <CommandMenuList
          commandGroups={[]}
          selectableItemIds={selectableItemIds}
        >
          <CommandGroup heading={t`Objects`}>
            {filteredObjects.map((objectMetadataItem) =>
              isViewItem ? (
                <CommandMenuSelectObjectForViewEditMenuItem
                  key={objectMetadataItem.id}
                  objectMetadataItem={objectMetadataItem}
                  onSelect={handleSelectObjectForViewEdit}
                />
              ) : (
                <CommandMenuSelectObjectForEditMenuItem
                  key={objectMetadataItem.id}
                  objectMetadataItem={objectMetadataItem}
                  onSelect={handleChangeObject}
                />
              ),
            )}
            <SelectableListItem
              itemId="system"
              onEnter={() => setEditSubView('object-picker-system')}
            >
              <CommandMenuItem
                Icon={IconSettings}
                label={t`System objects`}
                id="system"
                hasSubMenu={true}
                onClick={() => setEditSubView('object-picker-system')}
              />
            </SelectableListItem>
          </CommandGroup>
        </CommandMenuList>
      </CommandMenuSubViewWithSearch>
    );
  }

  if (editSubView === 'view-picker') {
    const filteredViews = viewsForViewPicker.filter((view) =>
      view.name.toLowerCase().includes(viewSearchInput.toLowerCase().trim()),
    );
    const selectableItemIds =
      filteredViews.length > 0
        ? filteredViews.map((view) => view.id)
        : ['empty'];
    const selectedObjectForViewEdit = isDefined(
      selectedObjectMetadataIdForViewEdit,
    )
      ? objectMetadataItems.find(
          (item) => item.id === selectedObjectMetadataIdForViewEdit,
        )
      : undefined;
    const backBarLabel = isDefined(selectedObjectForViewEdit)
      ? selectedObjectForViewEdit.labelPlural
      : t`Pick a view`;
    const isEmpty = filteredViews.length === 0;
    const noResultsText =
      viewSearchInput.trim().length > 0
        ? t`No results found`
        : t`No custom views available`;

    return (
      <CommandMenuSubViewWithSearch
        backBarTitle={backBarLabel}
        onBack={handleBackFromViewPicker}
        searchPlaceholder={t`Search a view...`}
        searchValue={viewSearchInput}
        onSearchChange={setViewSearchInput}
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
                onEnter={() => handleChangeView(view)}
              >
                <CommandMenuItem
                  Icon={getIcon(view.icon)}
                  label={view.name}
                  id={view.id}
                  onClick={() => handleChangeView(view)}
                />
              </SelectableListItem>
            ))}
          </CommandGroup>
        </CommandMenuList>
      </CommandMenuSubViewWithSearch>
    );
  }

  if (editSubView === 'folder-rename') {
    return (
      <CommandMenuSubViewWithSearch
        backBarTitle={t`Rename folder`}
        onBack={() => {
          setEditSubView(null);
          setFolderRenameInput('');
        }}
        searchPlaceholder={t`Folder name`}
        searchValue={folderRenameInput}
        onSearchChange={setFolderRenameInput}
        searchInputProps={{
          onKeyDown: (event) => {
            if (event.key === 'Enter' && folderRenameInput.trim().length > 0) {
              handleRenameFolder();
            }
          },
        }}
      />
    );
  }

  if (isObjectItem) {
    const selectableItemIds = [
      'object',
      'move-up',
      'move-down',
      'move-to-folder',
      'remove',
    ];

    return (
      <CommandMenuList commandGroups={[]} selectableItemIds={selectableItemIds}>
        <CommandGroup heading={t`Customize`}>
          <SelectableListItem
            itemId="object"
            onEnter={() => setEditSubView('object-picker')}
          >
            <CommandMenuItem
              Icon={
                StandardObjectIcon ??
                getIcon(
                  selectedItem.type === 'objectView'
                    ? selectedItem.objectMetadataItem.icon
                    : 'IconCube',
                )
              }
              label={t`Object`}
              description={selectedItemLabel ?? undefined}
              contextualTextPosition="right"
              hasSubMenu={true}
              id="object"
              onClick={() => setEditSubView('object-picker')}
            />
          </SelectableListItem>
        </CommandGroup>
        <CommandGroup heading={t`Organize`}>
          <SelectableListItem
            itemId="move-up"
            onEnter={canMoveUp ? handleMoveUp : undefined}
          >
            <CommandMenuItem
              Icon={IconChevronUp}
              label={t`Move up`}
              id="move-up"
              onClick={handleMoveUp}
              disabled={!canMoveUp}
            />
          </SelectableListItem>
          <SelectableListItem
            itemId="move-down"
            onEnter={canMoveDown ? handleMoveDown : undefined}
          >
            <CommandMenuItem
              Icon={IconChevronDown}
              label={t`Move down`}
              id="move-down"
              onClick={handleMoveDown}
              disabled={!canMoveDown}
            />
          </SelectableListItem>
          <SelectableListItem
            itemId="move-to-folder"
            onEnter={() => setEditSubView('folder-picker')}
          >
            <CommandMenuItem
              Icon={IconFolder}
              label={t`Move to folder`}
              id="move-to-folder"
              onClick={() => setEditSubView('folder-picker')}
            />
          </SelectableListItem>
          <SelectableListItem itemId="remove" onEnter={handleRemove}>
            <CommandMenuItem
              Icon={IconTrash}
              label={t`Remove from sidebar`}
              id="remove"
              onClick={handleRemove}
            />
          </SelectableListItem>
        </CommandGroup>
      </CommandMenuList>
    );
  }

  if (isViewItem && selectedItem?.type === 'objectView') {
    const selectableItemIds = [
      'object',
      'view',
      'move-up',
      'move-down',
      'move-to-folder',
      'remove',
    ];

    return (
      <CommandMenuList commandGroups={[]} selectableItemIds={selectableItemIds}>
        <CommandGroup heading={t`Customize`}>
          <SelectableListItem
            itemId="object"
            onEnter={() => setEditSubView('object-picker')}
          >
            <CommandMenuItem
              Icon={
                StandardObjectIcon ??
                getIcon(selectedItem.objectMetadataItem.icon ?? 'IconCube')
              }
              label={t`Object`}
              description={selectedItemLabel ?? undefined}
              contextualTextPosition="right"
              hasSubMenu={true}
              id="object"
              onClick={() => setEditSubView('object-picker')}
            />
          </SelectableListItem>
          <SelectableListItem
            itemId="view"
            onEnter={() => setEditSubView('view-picker')}
          >
            <CommandMenuItem
              Icon={getIcon(selectedItem.navigationMenuItem.Icon ?? 'IconList')}
              label={t`View`}
              description={selectedViewLabel ?? undefined}
              contextualTextPosition="right"
              hasSubMenu={true}
              id="view"
              onClick={() => setEditSubView('view-picker')}
            />
          </SelectableListItem>
        </CommandGroup>
        <CommandGroup heading={t`Organize`}>
          <SelectableListItem
            itemId="move-up"
            onEnter={canMoveUp ? handleMoveUp : undefined}
          >
            <CommandMenuItem
              Icon={IconChevronUp}
              label={t`Move up`}
              id="move-up"
              onClick={handleMoveUp}
              disabled={!canMoveUp}
            />
          </SelectableListItem>
          <SelectableListItem
            itemId="move-down"
            onEnter={canMoveDown ? handleMoveDown : undefined}
          >
            <CommandMenuItem
              Icon={IconChevronDown}
              label={t`Move down`}
              id="move-down"
              onClick={handleMoveDown}
              disabled={!canMoveDown}
            />
          </SelectableListItem>
          <SelectableListItem
            itemId="move-to-folder"
            onEnter={() => setEditSubView('folder-picker')}
          >
            <CommandMenuItem
              Icon={IconFolder}
              label={t`Move to folder`}
              id="move-to-folder"
              onClick={() => setEditSubView('folder-picker')}
            />
          </SelectableListItem>
          <SelectableListItem itemId="remove" onEnter={handleRemove}>
            <CommandMenuItem
              Icon={IconTrash}
              label={t`Remove from sidebar`}
              id="remove"
              onClick={handleRemove}
            />
          </SelectableListItem>
        </CommandGroup>
      </CommandMenuList>
    );
  }

  if (isLinkItem && selectedItem?.type === 'link') {
    const linkUrl = selectedItem.navigationMenuItem.link ?? '';
    const selectableItemIds = [
      'move-up',
      'move-down',
      'move-to-folder',
      'remove',
      'standard-app',
      'reset-to-default',
    ];

    return (
      <CommandMenuList commandGroups={[]} selectableItemIds={selectableItemIds}>
        <CommandGroup heading={t`Customize`}>
          <TextInput
            fullWidth
            placeholder="www.google.com"
            value={urlEditInput || linkUrl}
            onChange={(value) => setUrlEditInput(value)}
            onBlur={(event) => {
              const value = event.target.value.trim();
              if (isNonEmptyString(value)) {
                const normalizedLink =
                  value.startsWith('http://') || value.startsWith('https://')
                    ? value
                    : `https://${value}`;
                updateLinkInDraft(selectedItem.navigationMenuItem.id, {
                  link: normalizedLink,
                });
              }
              setUrlEditInput('');
            }}
          />
        </CommandGroup>
        <CommandGroup heading={t`Organize`}>
          <SelectableListItem
            itemId="move-up"
            onEnter={canMoveUp ? handleMoveUp : undefined}
          >
            <CommandMenuItem
              Icon={IconChevronUp}
              label={t`Move up`}
              id="move-up"
              onClick={handleMoveUp}
              disabled={!canMoveUp}
            />
          </SelectableListItem>
          <SelectableListItem
            itemId="move-down"
            onEnter={canMoveDown ? handleMoveDown : undefined}
          >
            <CommandMenuItem
              Icon={IconChevronDown}
              label={t`Move down`}
              id="move-down"
              onClick={handleMoveDown}
              disabled={!canMoveDown}
            />
          </SelectableListItem>
          <SelectableListItem
            itemId="move-to-folder"
            onEnter={() => setEditSubView('folder-picker')}
          >
            <CommandMenuItem
              Icon={IconFolder}
              label={t`Move to folder`}
              id="move-to-folder"
              hasSubMenu={true}
              onClick={() => setEditSubView('folder-picker')}
            />
          </SelectableListItem>
          <SelectableListItem itemId="remove" onEnter={handleRemove}>
            <CommandMenuItem
              Icon={IconTrash}
              label={t`Remove from sidebar`}
              id="remove"
              onClick={handleRemove}
            />
          </SelectableListItem>
        </CommandGroup>
        <CommandGroup heading={t`Owner`}>
          <SelectableListItem itemId="standard-app" onEnter={() => {}}>
            <CommandMenuItem
              Icon={IconApps}
              label={t`Standard app`}
              id="standard-app"
              disabled={true}
              onClick={() => {}}
            />
          </SelectableListItem>
          <SelectableListItem itemId="reset-to-default" onEnter={() => {}}>
            <CommandMenuItem
              Icon={IconRefresh}
              label={t`Reset to default`}
              id="reset-to-default"
              disabled={true}
              onClick={() => {}}
            />
          </SelectableListItem>
        </CommandGroup>
      </CommandMenuList>
    );
  }

  if (isFolderItem && selectedItem?.type === 'folder') {
    const selectableItemIds = [
      'move-up',
      'move-down',
      'remove',
      'standard-app',
      'reset-to-default',
    ];

    return (
      <CommandMenuList commandGroups={[]} selectableItemIds={selectableItemIds}>
        <CommandGroup heading={t`Organize`}>
          <SelectableListItem
            itemId="move-up"
            onEnter={canMoveUp ? handleMoveUp : undefined}
          >
            <CommandMenuItem
              Icon={IconChevronUp}
              label={t`Move up`}
              id="move-up"
              onClick={handleMoveUp}
              disabled={!canMoveUp}
            />
          </SelectableListItem>
          <SelectableListItem
            itemId="move-down"
            onEnter={canMoveDown ? handleMoveDown : undefined}
          >
            <CommandMenuItem
              Icon={IconChevronDown}
              label={t`Move down`}
              id="move-down"
              onClick={handleMoveDown}
              disabled={!canMoveDown}
            />
          </SelectableListItem>
          <SelectableListItem itemId="remove" onEnter={handleRemove}>
            <CommandMenuItem
              Icon={IconTrash}
              label={t`Remove from sidebar`}
              id="remove"
              onClick={handleRemove}
            />
          </SelectableListItem>
        </CommandGroup>
        <CommandGroup heading={t`Owner`}>
          <SelectableListItem itemId="standard-app" onEnter={() => {}}>
            <CommandMenuItem
              Icon={IconApps}
              label={t`Standard app`}
              id="standard-app"
              disabled={true}
              onClick={() => {}}
            />
          </SelectableListItem>
          <SelectableListItem itemId="reset-to-default" onEnter={() => {}}>
            <CommandMenuItem
              Icon={IconRefresh}
              label={t`Reset to default`}
              id="reset-to-default"
              disabled={true}
              onClick={() => {}}
            />
          </SelectableListItem>
        </CommandGroup>
      </CommandMenuList>
    );
  }

  const selectableItemIds = [
    'move-up',
    'move-down',
    'move-to-folder',
    'remove',
  ];

  return (
    <CommandMenuList commandGroups={[]} selectableItemIds={selectableItemIds}>
      <CommandGroup heading={t`Organize`}>
        <SelectableListItem
          itemId="move-up"
          onEnter={canMoveUp ? handleMoveUp : undefined}
        >
          <CommandMenuItem
            Icon={IconChevronUp}
            label={t`Move up`}
            id="move-up"
            onClick={handleMoveUp}
            disabled={!canMoveUp}
          />
        </SelectableListItem>
        <SelectableListItem
          itemId="move-down"
          onEnter={canMoveDown ? handleMoveDown : undefined}
        >
          <CommandMenuItem
            Icon={IconChevronDown}
            label={t`Move down`}
            id="move-down"
            onClick={handleMoveDown}
            disabled={!canMoveDown}
          />
        </SelectableListItem>
        <SelectableListItem
          itemId="move-to-folder"
          onEnter={() => setEditSubView('folder-picker')}
        >
          <CommandMenuItem
            Icon={IconFolder}
            label={t`Move to folder`}
            id="move-to-folder"
            onClick={() => setEditSubView('folder-picker')}
          />
        </SelectableListItem>
        <SelectableListItem itemId="remove" onEnter={handleRemove}>
          <CommandMenuItem
            Icon={IconTrash}
            label={t`Remove from sidebar`}
            id="remove"
            onClick={handleRemove}
          />
        </SelectableListItem>
      </CommandGroup>
    </CommandMenuList>
  );
};
