import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import {
  StyledCommandMenuPageContainer,
  StyledCommandMenuPlaceholder,
} from '@/command-menu/components/CommandMenuSharedStyles';
import { CommandMenuEditDefaultView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditDefaultView';
import { CommandMenuEditFolderItemView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditFolderItemView';
import { CommandMenuEditFolderPickerSubView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditFolderPickerSubView';
import { CommandMenuEditLinkItemView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditLinkItemView';
import { CommandMenuEditObjectItemView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditObjectItemView';
import { CommandMenuEditObjectPickerSubView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditObjectPickerSubView';
import { CommandMenuEditObjectPickerSystemSubView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditObjectPickerSystemSubView';
import { CommandMenuEditViewItemView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditViewItemView';
import { CommandMenuEditViewPickerSubView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditViewPickerSubView';
import { useNavigationMenuItemMoveRemove } from '@/navigation-menu-item/hooks/useNavigationMenuItemMoveRemove';
import { useNavigationMenuItemsByFolder } from '@/navigation-menu-item/hooks/useNavigationMenuItemsByFolder';
import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/hooks/useNavigationMenuItemsDraftState';
import { useNavigationMenuObjectMetadataFromDraft } from '@/navigation-menu-item/hooks/useNavigationMenuObjectMetadataFromDraft';
import { useUpdateNavigationMenuItemsDraft } from '@/navigation-menu-item/hooks/useUpdateNavigationMenuItemsDraft';
import { type WorkspaceSectionItem } from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { useFlattenedWorkspaceSectionItemsForLookup } from '@/navigation-menu-item/hooks/useFlattenedWorkspaceSectionItemsForLookup';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { getWorkspaceSectionItemId } from '@/navigation-menu-item/utils/getWorkspaceSectionItemId';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/utils/isNavigationMenuItemFolder';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type View } from '@/views/types/View';
import { ViewKey } from '@/views/types/ViewKey';

const isObjectNavItem = (item: WorkspaceSectionItem): boolean =>
  item.type === 'objectView' &&
  item.navigationMenuItem.viewKey === ViewKey.Index &&
  !isDefined(item.navigationMenuItem.targetRecordId);

const isViewNavItem = (item: WorkspaceSectionItem): boolean =>
  item.type === 'objectView' &&
  item.navigationMenuItem.viewKey !== ViewKey.Index &&
  isDefined(item.navigationMenuItem.viewId) &&
  !isDefined(item.navigationMenuItem.targetRecordId);

export const CommandMenuNavigationMenuItemEditPage = () => {
  const { t } = useLingui();
  const { closeCommandMenu } = useCommandMenu();
  const [editSubView, setEditSubView] = useState<
    | 'object-picker'
    | 'object-picker-system'
    | 'folder-picker'
    | 'view-picker'
    | null
  >(null);
  const [
    selectedObjectMetadataIdForViewEdit,
    setSelectedObjectMetadataIdForViewEdit,
  ] = useState<string | null>(null);
  const [objectSearchInput, setObjectSearchInput] = useState('');
  const [systemObjectSearchInput, setSystemObjectSearchInput] = useState('');
  const [folderSearchInput, setFolderSearchInput] = useState('');
  const [viewSearchInput, setViewSearchInput] = useState('');

  const selectedNavigationMenuItemInEditMode = useRecoilValue(
    selectedNavigationMenuItemInEditModeState,
  );
  const setSelectedNavigationMenuItemInEditMode = useSetRecoilState(
    selectedNavigationMenuItemInEditModeState,
  );
  const workspaceSectionItems = useFlattenedWorkspaceSectionItemsForLookup();
  const { moveUp, moveDown, remove, moveToFolder } =
    useNavigationMenuItemMoveRemove();
  const { updateObjectInDraft, updateViewInDraft, updateLinkInDraft } =
    useUpdateNavigationMenuItemsDraft();
  const { workspaceNavigationMenuItems, navigationMenuItemsDraft } =
    useNavigationMenuItemsDraftState();
  const { workspaceNavigationMenuItemsByFolder } =
    useNavigationMenuItemsByFolder();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();

  const currentDraft = isDefined(navigationMenuItemsDraft)
    ? navigationMenuItemsDraft
    : workspaceNavigationMenuItems;

  const {
    objectMetadataIdsInWorkspace: objectMetadataItemsInWorkspaceIds,
    objectMetadataIdsWithIndexView,
    objectMetadataIdsWithAnyView,
  } = useNavigationMenuObjectMetadataFromDraft(currentDraft);

  const selectedItem = selectedNavigationMenuItemInEditMode
    ? workspaceSectionItems.find(
        (item) =>
          getWorkspaceSectionItemId(item) ===
          selectedNavigationMenuItemInEditMode,
      )
    : undefined;

  const selectedItemLabel = selectedItem
    ? selectedItem.type === 'folder'
      ? selectedItem.folder.folderName
      : selectedItem.type === 'link'
        ? (selectedItem.navigationMenuItem.name ?? 'Link')
        : selectedItem.objectMetadataItem.labelPlural
    : null;

  const selectedItemIndex = selectedNavigationMenuItemInEditMode
    ? workspaceSectionItems.findIndex(
        (item) =>
          getWorkspaceSectionItemId(item) ===
          selectedNavigationMenuItemInEditMode,
      )
    : -1;

  const isItemInsideFolder =
    selectedItem?.type !== 'folder' &&
    isDefined(selectedItem?.navigationMenuItem.folderId);
  const canMoveUp = !isItemInsideFolder && selectedItemIndex > 0;
  const canMoveDown =
    !isItemInsideFolder &&
    selectedItemIndex >= 0 &&
    selectedItemIndex < workspaceSectionItems.length - 1;

  const isObjectItem =
    selectedItem !== undefined && isObjectNavItem(selectedItem);
  const isViewItem = selectedItem !== undefined && isViewNavItem(selectedItem);
  const isFolderItem =
    selectedItem !== undefined && selectedItem.type === 'folder';
  const isLinkItem = selectedItem !== undefined && selectedItem.type === 'link';

  const objectsForObjectPicker = activeNonSystemObjectMetadataItems
    .filter((item) => objectMetadataIdsWithIndexView.has(item.id))
    .filter((item) => !objectMetadataItemsInWorkspaceIds.has(item.id))
    .sort((a, b) => a.labelPlural.localeCompare(b.labelPlural));

  const currentObjectMetadataId =
    selectedItem?.type === 'objectView'
      ? (selectedItem.navigationMenuItem.targetObjectMetadataId ?? undefined)
      : undefined;
  const currentObject =
    currentObjectMetadataId !== undefined
      ? objectMetadataItems.find((item) => item.id === currentObjectMetadataId)
      : undefined;
  const objectsForObjectPickerIncludingCurrent =
    currentObject !== undefined &&
    !objectsForObjectPicker.some((o) => o.id === currentObject.id)
      ? [currentObject, ...objectsForObjectPicker].sort((a, b) =>
          a.labelPlural.localeCompare(b.labelPlural),
        )
      : objectsForObjectPicker;

  const activeSystemObjectMetadataItems = objectMetadataItems
    .filter((item) => item.isActive && item.isSystem)
    .sort((a, b) => a.labelPlural.localeCompare(b.labelPlural));

  const systemObjectsForObjectPicker = activeSystemObjectMetadataItems.filter(
    (item) =>
      objectMetadataIdsWithIndexView.has(item.id) &&
      (objectMetadataItemsInWorkspaceIds.has(item.id)
        ? item.id === currentObjectMetadataId
        : true),
  );

  const objectsForViewEdit = activeNonSystemObjectMetadataItems.filter((item) =>
    objectMetadataIdsWithAnyView.has(item.id),
  );
  const objectsForViewEditObjectPicker =
    currentObject !== undefined &&
    !objectsForViewEdit.some((object) => object.id === currentObject.id)
      ? [currentObject, ...objectsForViewEdit].sort((a, b) =>
          a.labelPlural.localeCompare(b.labelPlural),
        )
      : objectsForViewEdit.sort((a, b) =>
          a.labelPlural.localeCompare(b.labelPlural),
        );

  const systemObjectsForViewEditObjectPicker =
    activeSystemObjectMetadataItems.filter((item) =>
      objectMetadataIdsWithAnyView.has(item.id),
    );

  const workspaceFolders = workspaceNavigationMenuItemsByFolder.map(
    (folder) => ({
      id: folder.folderId,
      name: folder.folderName,
    }),
  );

  const allFolders =
    currentDraft?.filter(isNavigationMenuItemFolder).map((item) => ({
      id: item.id,
      name: item.name ?? 'Folder',
      folderId: item.folderId ?? undefined,
    })) ?? [];

  if (!selectedNavigationMenuItemInEditMode || !selectedItemLabel) {
    return (
      <StyledCommandMenuPageContainer>
        <StyledCommandMenuPlaceholder>
          {t`Select a navigation item to edit`}
        </StyledCommandMenuPlaceholder>
      </StyledCommandMenuPageContainer>
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

  if (editSubView === 'folder-picker') {
    return (
      <CommandMenuEditFolderPickerSubView
        allFolders={allFolders}
        workspaceFolders={workspaceFolders}
        isFolderItem={isFolderItem}
        isLinkItem={isLinkItem}
        selectedFolderId={
          isFolderItem || isLinkItem
            ? selectedNavigationMenuItemInEditMode
            : null
        }
        searchValue={folderSearchInput}
        onSearchChange={setFolderSearchInput}
        onBack={() => setEditSubView(null)}
        onSelectFolder={handleMoveToFolder}
      />
    );
  }

  if (editSubView === 'object-picker-system') {
    const systemObjects = isViewItem
      ? systemObjectsForViewEditObjectPicker
      : systemObjectsForObjectPicker;
    return (
      <CommandMenuEditObjectPickerSystemSubView
        systemObjects={systemObjects}
        searchValue={systemObjectSearchInput}
        onSearchChange={setSystemObjectSearchInput}
        onBack={() => setEditSubView('object-picker')}
        isViewItem={isViewItem}
        onSelectObjectForEdit={handleChangeObject}
        onSelectObjectForViewEdit={handleSelectObjectForViewEdit}
      />
    );
  }

  if (editSubView === 'object-picker') {
    const objects = isViewItem
      ? objectsForViewEditObjectPicker
      : objectsForObjectPickerIncludingCurrent;
    return (
      <CommandMenuEditObjectPickerSubView
        objects={objects}
        searchValue={objectSearchInput}
        onSearchChange={setObjectSearchInput}
        onBack={() => setEditSubView(null)}
        onOpenSystemPicker={() => setEditSubView('object-picker-system')}
        isViewItem={isViewItem}
        onSelectObjectForEdit={handleChangeObject}
        onSelectObjectForViewEdit={handleSelectObjectForViewEdit}
      />
    );
  }

  if (editSubView === 'view-picker') {
    return (
      <CommandMenuEditViewPickerSubView
        currentDraft={currentDraft}
        selectedObjectMetadataIdForViewEdit={
          selectedObjectMetadataIdForViewEdit
        }
        selectedItem={selectedItem}
        currentItemId={selectedNavigationMenuItemInEditMode}
        objectMetadataItems={objectMetadataItems}
        searchValue={viewSearchInput}
        onSearchChange={setViewSearchInput}
        onBack={handleBackFromViewPicker}
        onSelectView={handleChangeView}
      />
    );
  }

  if (isObjectItem && selectedItem?.type === 'objectView') {
    return (
      <CommandMenuEditObjectItemView
        selectedItem={selectedItem}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        onOpenObjectPicker={() => setEditSubView('object-picker')}
        onOpenFolderPicker={() => setEditSubView('folder-picker')}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        onRemove={handleRemove}
      />
    );
  }

  if (isViewItem && selectedItem?.type === 'objectView') {
    return (
      <CommandMenuEditViewItemView
        selectedItem={selectedItem}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        onOpenObjectPicker={() => setEditSubView('object-picker')}
        onOpenViewPicker={() => setEditSubView('view-picker')}
        onOpenFolderPicker={() => setEditSubView('folder-picker')}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        onRemove={handleRemove}
      />
    );
  }

  if (isLinkItem && selectedItem?.type === 'link') {
    return (
      <CommandMenuEditLinkItemView
        selectedItem={selectedItem}
        onUpdateLink={(linkId, link) => updateLinkInDraft(linkId, { link })}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        onOpenFolderPicker={() => setEditSubView('folder-picker')}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        onRemove={handleRemove}
      />
    );
  }

  if (isFolderItem && selectedItem?.type === 'folder') {
    return (
      <CommandMenuEditFolderItemView
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        onRemove={handleRemove}
      />
    );
  }

  return (
    <CommandMenuEditDefaultView
      canMoveUp={canMoveUp}
      canMoveDown={canMoveDown}
      onMoveUp={handleMoveUp}
      onMoveDown={handleMoveDown}
      onRemove={handleRemove}
      onOpenFolderPicker={() => setEditSubView('folder-picker')}
    />
  );
};
