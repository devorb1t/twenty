import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useMemo, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronUp,
  IconFolder,
  IconSettings,
  IconTrash,
  useIcons,
} from 'twenty-ui/display';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useNavigationMenuItemMoveRemove } from '@/navigation-menu-item/hooks/useNavigationMenuItemMoveRemove';
import { useNavigationMenuItemsByFolder } from '@/navigation-menu-item/hooks/useNavigationMenuItemsByFolder';
import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/hooks/useNavigationMenuItemsDraftState';
import {
  type WorkspaceSectionItem,
  useWorkspaceSectionItems,
} from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { useUpdateNavigationMenuItemsDraft } from '@/navigation-menu-item/hooks/useUpdateNavigationMenuItemsDraft';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useGetStandardObjectIcon } from '@/object-metadata/hooks/useGetStandardObjectIcon';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
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

const StyledBackBar = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(2, 3)};
  text-align: left;
  width: 100%;

  &:hover {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

const StyledSearchContainer = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  min-width: 0;
  padding: ${({ theme }) => theme.spacing(2, 3)};
`;

const StyledSearchInput = styled.input`
  background: transparent;
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-sizing: border-box;
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  padding: 0;
  width: 100%;
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.font.color.tertiary};
  }
`;

const StyledSubViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
`;

const StyledScrollableListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;

  & > * {
    flex: 1;
    min-height: 0;
  }
`;

const getWorkspaceSectionItemId = (item: WorkspaceSectionItem): string =>
  item.type === 'folder' ? item.folder.folderId : item.navigationMenuItem.id;

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
  const [objectSearchInput, setObjectSearchInput] = useState('');
  const [systemObjectSearchInput, setSystemObjectSearchInput] = useState('');
  const [folderSearchInput, setFolderSearchInput] = useState('');
  const [folderRenameInput, setFolderRenameInput] = useState('');
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

  const objectMetadataIdsWithIndexView = useMemo(() => {
    const views = coreViews.map(convertCoreViewToView);
    return new Set(
      views
        .filter((view) => view.key === ViewKey.Index)
        .map((view) => view.objectMetadataId),
    );
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
    if (!isViewItem || selectedItem?.type !== 'objectView') return [];
    const objectMetadataId = selectedItem.objectMetadataItem.id;
    const views = coreViews.map(convertCoreViewToView);
    return views
      .filter(
        (view) =>
          view.objectMetadataId === objectMetadataId &&
          view.key !== ViewKey.Index &&
          !viewIdsInOtherSidebarItems.has(view.id),
      )
      .sort((a, b) => a.position - b.position);
  }, [coreViews, isViewItem, selectedItem, viewIdsInOtherSidebarItems]);

  const workspaceFolders = workspaceNavigationMenuItemsByFolder.map(
    (folder) => ({
      id: folder.folderId,
      name: folder.folderName,
    }),
  );

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

  const handleMoveToFolder = (folderId: string | null) => {
    moveToFolder(selectedNavigationMenuItemInEditMode, folderId);
    setEditSubView(null);
    closeCommandMenu();
  };

  const handleChangeView = (view: View) => {
    updateViewInDraft(selectedNavigationMenuItemInEditMode, view);
    setEditSubView(null);
    closeCommandMenu();
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
    const filteredFolders = workspaceFolders.filter((folder) =>
      folder.name
        .toLowerCase()
        .includes(folderSearchInput.toLowerCase().trim()),
    );
    const selectableItemIds = ['root', ...filteredFolders.map((f) => f.id)];

    return (
      <StyledSubViewContainer>
        <StyledBackBar onClick={() => setEditSubView(null)}>
          <IconChevronLeft size={16} />
          {t`Move to a folder`}
        </StyledBackBar>
        <StyledSearchContainer>
          <StyledSearchInput
            placeholder={t`Search a folder...`}
            value={folderSearchInput}
            onChange={(event) => setFolderSearchInput(event.target.value)}
            autoFocus
          />
        </StyledSearchContainer>
        <StyledScrollableListWrapper>
          <CommandMenuList
            commandGroups={[]}
            selectableItemIds={selectableItemIds}
          >
            <CommandGroup heading={t`Folders`}>
              <SelectableListItem
                itemId="root"
                onEnter={() => handleMoveToFolder(null)}
              >
                <CommandMenuItem
                  label={t`No folder`}
                  id="root"
                  onClick={() => handleMoveToFolder(null)}
                />
              </SelectableListItem>
              {filteredFolders.map((folder) => (
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
              ))}
            </CommandGroup>
          </CommandMenuList>
        </StyledScrollableListWrapper>
      </StyledSubViewContainer>
    );
  }

  if (editSubView === 'object-picker-system') {
    const filteredSystemObjects = systemObjectsForObjectPicker.filter((item) =>
      item.labelPlural
        .toLowerCase()
        .includes(systemObjectSearchInput.toLowerCase().trim()),
    );
    const selectableItemIds =
      filteredSystemObjects.length > 0
        ? filteredSystemObjects.map((item) => item.id)
        : ['empty'];

    return (
      <StyledSubViewContainer>
        <StyledBackBar onClick={() => setEditSubView('object-picker')}>
          <IconChevronLeft size={16} />
          {t`System objects`}
        </StyledBackBar>
        <StyledSearchContainer>
          <StyledSearchInput
            placeholder={t`Search a system object...`}
            value={systemObjectSearchInput}
            onChange={(event) => setSystemObjectSearchInput(event.target.value)}
            autoFocus
          />
        </StyledSearchContainer>
        <StyledScrollableListWrapper>
          <CommandMenuList
            commandGroups={[]}
            selectableItemIds={selectableItemIds}
          >
            <CommandGroup heading={t`System objects`}>
              {filteredSystemObjects.map((objectMetadataItem) => (
                <CommandMenuSelectObjectForEditMenuItem
                  key={objectMetadataItem.id}
                  objectMetadataItem={objectMetadataItem}
                  onSelect={handleChangeObject}
                />
              ))}
            </CommandGroup>
          </CommandMenuList>
        </StyledScrollableListWrapper>
      </StyledSubViewContainer>
    );
  }

  if (editSubView === 'object-picker') {
    const filteredObjects = objectsForObjectPickerIncludingCurrent.filter(
      (item) =>
        item.labelPlural
          .toLowerCase()
          .includes(objectSearchInput.toLowerCase().trim()),
    );
    const selectableItemIds =
      filteredObjects.length > 0
        ? [...filteredObjects.map((item) => item.id), 'system']
        : ['empty', 'system'];

    return (
      <StyledSubViewContainer>
        <StyledBackBar onClick={() => setEditSubView(null)}>
          <IconChevronLeft size={16} />
          {t`Pick an object`}
        </StyledBackBar>
        <StyledSearchContainer>
          <StyledSearchInput
            placeholder={t`Search an object...`}
            value={objectSearchInput}
            onChange={(event) => setObjectSearchInput(event.target.value)}
            autoFocus
          />
        </StyledSearchContainer>
        <StyledScrollableListWrapper>
          <CommandMenuList
            commandGroups={[]}
            selectableItemIds={selectableItemIds}
          >
            <CommandGroup heading={t`Objects`}>
              {filteredObjects.map((objectMetadataItem) => (
                <CommandMenuSelectObjectForEditMenuItem
                  key={objectMetadataItem.id}
                  objectMetadataItem={objectMetadataItem}
                  onSelect={handleChangeObject}
                />
              ))}
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
        </StyledScrollableListWrapper>
      </StyledSubViewContainer>
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

    return (
      <StyledSubViewContainer>
        <StyledBackBar onClick={() => setEditSubView(null)}>
          <IconChevronLeft size={16} />
          {t`Pick a view`}
        </StyledBackBar>
        <StyledSearchContainer>
          <StyledSearchInput
            placeholder={t`Search a view...`}
            value={viewSearchInput}
            onChange={(event) => setViewSearchInput(event.target.value)}
            autoFocus
          />
        </StyledSearchContainer>
        <StyledScrollableListWrapper>
          <CommandMenuList
            commandGroups={[]}
            selectableItemIds={selectableItemIds}
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
        </StyledScrollableListWrapper>
      </StyledSubViewContainer>
    );
  }

  if (editSubView === 'folder-rename') {
    return (
      <StyledSubViewContainer>
        <StyledBackBar
          onClick={() => {
            setEditSubView(null);
            setFolderRenameInput('');
          }}
        >
          <IconChevronLeft size={16} />
          {t`Rename folder`}
        </StyledBackBar>
        <StyledSearchContainer>
          <StyledSearchInput
            placeholder={t`Folder name`}
            value={folderRenameInput}
            onChange={(event) => setFolderRenameInput(event.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === 'Enter' &&
                folderRenameInput.trim().length > 0
              ) {
                handleRenameFolder();
              }
            }}
            autoFocus
          />
        </StyledSearchContainer>
      </StyledSubViewContainer>
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
            itemId="view"
            onEnter={() => setEditSubView('view-picker')}
          >
            <CommandMenuItem
              Icon={getIcon(selectedItem.navigationMenuItem.Icon ?? 'IconList')}
              label={t`View`}
              description={selectedViewLabel ?? selectedItemLabel ?? undefined}
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

  if (isFolderItem && selectedItem?.type === 'folder') {
    const selectableItemIds = [
      'rename',
      'move-up',
      'move-down',
      'move-to-folder',
      'remove',
    ];

    return (
      <CommandMenuList commandGroups={[]} selectableItemIds={selectableItemIds}>
        <CommandGroup heading={t`Customize`}>
          <SelectableListItem
            itemId="rename"
            onEnter={() => {
              setFolderRenameInput(selectedItem.folder.folderName);
              setEditSubView('folder-rename');
            }}
          >
            <CommandMenuItem
              Icon={IconFolder}
              label={t`Rename`}
              description={selectedItem.folder.folderName}
              contextualTextPosition="right"
              hasSubMenu={true}
              id="rename"
              onClick={() => {
                setFolderRenameInput(selectedItem.folder.folderName);
                setEditSubView('folder-rename');
              }}
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
