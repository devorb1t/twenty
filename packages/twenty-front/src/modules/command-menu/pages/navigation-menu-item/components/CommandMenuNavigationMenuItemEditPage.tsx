import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

import {
  StyledCommandMenuPageContainer,
  StyledCommandMenuPlaceholder,
} from '@/command-menu/components/CommandMenuSharedStyles';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { CommandMenuEditDefaultView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditDefaultView';
import { CommandMenuEditFolderItemView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditFolderItemView';
import { CommandMenuEditFolderPickerSubView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditFolderPickerSubView';
import { CommandMenuEditLinkItemView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditLinkItemView';
import { CommandMenuEditObjectViewBase } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditObjectViewBase';
import { CommandMenuEditViewPickerSubView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditViewPickerSubView';
import { CommandMenuObjectMenuItem } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuObjectMenuItem';
import { CommandMenuObjectPickerSubView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuObjectPickerSubView';
import { CommandMenuSelectObjectForViewMenuItem } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuSelectObjectForViewMenuItem';
import { CommandMenuSystemObjectPickerSubView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuSystemObjectPickerSubView';
import { useFlattenedWorkspaceSectionItemsForLookup } from '@/navigation-menu-item/hooks/useFlattenedWorkspaceSectionItemsForLookup';
import { useNavigationMenuItemMoveRemove } from '@/navigation-menu-item/hooks/useNavigationMenuItemMoveRemove';
import { useNavigationMenuItemsByFolder } from '@/navigation-menu-item/hooks/useNavigationMenuItemsByFolder';
import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/hooks/useNavigationMenuItemsDraftState';
import { useNavigationMenuObjectMetadataFromDraft } from '@/navigation-menu-item/hooks/useNavigationMenuObjectMetadataFromDraft';
import { useUpdateNavigationMenuItemsDraft } from '@/navigation-menu-item/hooks/useUpdateNavigationMenuItemsDraft';
import { type WorkspaceSectionItem } from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/utils/isNavigationMenuItemFolder';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useGetStandardObjectIcon } from '@/object-metadata/hooks/useGetStandardObjectIcon';
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
        (item) => item.id === selectedNavigationMenuItemInEditMode,
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
        (item) => item.id === selectedNavigationMenuItemInEditMode,
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

  const { getIcon } = useIcons();
  const objectNameSingularForViewItem =
    selectedItem?.type === 'objectView'
      ? selectedItem.objectMetadataItem.nameSingular
      : '';
  const { Icon: StandardObjectIconForViewItem } = useGetStandardObjectIcon(
    objectNameSingularForViewItem,
  );
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
      id: folder.id,
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

  const organizeActionsProps = {
    canMoveUp,
    canMoveDown,
    onMoveUp: handleMoveUp,
    onMoveDown: handleMoveDown,
    onRemove: handleRemove,
  };

  const subViewHandlers = {
    setFolderPicker: () => setEditSubView('folder-picker'),
    setObjectPicker: () => setEditSubView('object-picker'),
    setObjectPickerSystem: () => setEditSubView('object-picker-system'),
    setViewPicker: () => setEditSubView('view-picker'),
    clearSubView: () => setEditSubView(null),
  };

  if (editSubView === 'folder-picker') {
    const currentFolderId =
      selectedItem?.type === 'folder'
        ? selectedItem.id
        : (selectedItem?.navigationMenuItem.folderId ?? null);

    return (
      <CommandMenuEditFolderPickerSubView
        allFolders={allFolders}
        workspaceFolders={workspaceFolders}
        isFolderItem={isFolderItem}
        isLinkItem={isLinkItem}
        selectedFolderId={
          isFolderItem ? selectedNavigationMenuItemInEditMode : null
        }
        currentFolderId={currentFolderId}
        searchValue={folderSearchInput}
        onSearchChange={setFolderSearchInput}
        onBack={subViewHandlers.clearSubView}
        onSelectFolder={handleMoveToFolder}
      />
    );
  }

  if (editSubView === 'object-picker-system') {
    const systemObjects = isViewItem
      ? systemObjectsForViewEditObjectPicker
      : systemObjectsForObjectPicker;
    return (
      <CommandMenuSystemObjectPickerSubView
        systemObjects={systemObjects}
        searchValue={systemObjectSearchInput}
        onSearchChange={setSystemObjectSearchInput}
        onBack={() => setEditSubView('object-picker')}
        renderObjectMenuItem={(objectMetadataItem) =>
          isViewItem ? (
            <CommandMenuSelectObjectForViewMenuItem
              objectMetadataItem={objectMetadataItem}
              onSelect={handleSelectObjectForViewEdit}
            />
          ) : (
            <CommandMenuObjectMenuItem
              objectMetadataItem={objectMetadataItem}
              onSelect={handleChangeObject}
              variant="edit"
            />
          )
        }
      />
    );
  }

  if (editSubView === 'object-picker') {
    const objects = isViewItem
      ? objectsForViewEditObjectPicker
      : objectsForObjectPickerIncludingCurrent;
    return (
      <CommandMenuObjectPickerSubView
        objects={objects}
        searchValue={objectSearchInput}
        onSearchChange={setObjectSearchInput}
        onBack={subViewHandlers.clearSubView}
        onOpenSystemPicker={subViewHandlers.setObjectPickerSystem}
        renderObjectMenuItem={(objectMetadataItem) =>
          isViewItem ? (
            <CommandMenuSelectObjectForViewMenuItem
              objectMetadataItem={objectMetadataItem}
              onSelect={handleSelectObjectForViewEdit}
            />
          ) : (
            <CommandMenuObjectMenuItem
              objectMetadataItem={objectMetadataItem}
              onSelect={handleChangeObject}
              variant="edit"
            />
          )
        }
        emptyNoResultsText={t`No objects available`}
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

  const mainViewConfig = [
    {
      condition: isObjectItem && selectedItem?.type === 'objectView',
      render: () =>
        selectedItem?.type === 'objectView' ? (
          <CommandMenuEditObjectViewBase
            objectIcon={
              StandardObjectIconForViewItem ??
              getIcon(selectedItem.objectMetadataItem.icon ?? 'IconCube')
            }
            objectLabel={selectedItem.objectMetadataItem.labelPlural ?? ''}
            onOpenObjectPicker={subViewHandlers.setObjectPicker}
            onOpenFolderPicker={subViewHandlers.setFolderPicker}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...organizeActionsProps}
          />
        ) : null,
    },
    {
      condition: isViewItem && selectedItem?.type === 'objectView',
      render: () =>
        selectedItem?.type === 'objectView' ? (
          <CommandMenuEditObjectViewBase
            objectIcon={
              StandardObjectIconForViewItem ??
              getIcon(selectedItem.objectMetadataItem.icon ?? 'IconCube')
            }
            objectLabel={selectedItem.objectMetadataItem.labelPlural ?? ''}
            onOpenObjectPicker={subViewHandlers.setObjectPicker}
            onOpenFolderPicker={subViewHandlers.setFolderPicker}
            viewRow={{
              icon: getIcon(selectedItem.navigationMenuItem.Icon ?? 'IconList'),
              label: selectedItem.navigationMenuItem.labelIdentifier ?? '',
              onClick: subViewHandlers.setViewPicker,
            }}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...organizeActionsProps}
          />
        ) : null,
    },
    {
      condition: isLinkItem && selectedItem?.type === 'link',
      render: () =>
        selectedItem?.type === 'link' ? (
          <CommandMenuEditLinkItemView
            selectedItem={selectedItem}
            onUpdateLink={(linkId, link) => updateLinkInDraft(linkId, { link })}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...organizeActionsProps}
            onOpenFolderPicker={subViewHandlers.setFolderPicker}
          />
        ) : null,
    },
    {
      condition: isFolderItem && selectedItem?.type === 'folder',
      render: () => {
        const folderApplicationId =
          selectedItem?.type === 'folder'
            ? currentDraft.find((item) => item.id === selectedItem.id)
                ?.applicationId
            : undefined;
        return (
          <CommandMenuEditFolderItemView
            applicationId={folderApplicationId}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...organizeActionsProps}
          />
        );
      },
    },
  ] as const;

  const matchingView = mainViewConfig.find((config) => config.condition);
  if (isDefined(matchingView)) {
    return matchingView.render();
  }

  return (
    <CommandMenuEditDefaultView
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...organizeActionsProps}
      onOpenFolderPicker={subViewHandlers.setFolderPicker}
    />
  );
};
