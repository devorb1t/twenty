import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { CommandMenuEditFolderPickerSubView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditFolderPickerSubView';
import { CommandMenuEditLinkItemView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditLinkItemView';
import { CommandMenuEditObjectViewBase } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditObjectViewBase';
import { CommandMenuEditOrganizeActions } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditOrganizeActions';
import { CommandMenuEditOwnerSection } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditOwnerSection';
import { CommandMenuEditViewPickerSubView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditViewPickerSubView';
import { CommandMenuObjectMenuItem } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuObjectMenuItem';
import { CommandMenuObjectPickerSubView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuObjectPickerSubView';
import { CommandMenuSystemObjectPickerSubView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuSystemObjectPickerSubView';
import { useNavigationMenuItemEditFolderData } from '@/command-menu/pages/navigation-menu-item/hooks/useNavigationMenuItemEditFolderData';
import { useNavigationMenuItemEditObjectPickerData } from '@/command-menu/pages/navigation-menu-item/hooks/useNavigationMenuItemEditObjectPickerData';
import { useNavigationMenuItemEditOrganizeActions } from '@/command-menu/pages/navigation-menu-item/hooks/useNavigationMenuItemEditOrganizeActions';
import { useNavigationMenuItemEditSubView } from '@/command-menu/pages/navigation-menu-item/hooks/useNavigationMenuItemEditSubView';
import { useSelectedNavigationMenuItemEditData } from '@/command-menu/pages/navigation-menu-item/hooks/useSelectedNavigationMenuItemEditData';
import { useNavigationMenuItemMoveRemove } from '@/navigation-menu-item/hooks/useNavigationMenuItemMoveRemove';
import { useUpdateNavigationMenuItemsDraft } from '@/navigation-menu-item/hooks/useUpdateNavigationMenuItemsDraft';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { type View } from '@/views/types/View';

const StyledCommandMenuPlaceholder = styled.p`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledCommandMenuPageContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(3)};
`;

export const CommandMenuNavigationMenuItemEditPage = () => {
  const { t } = useLingui();
  const { closeCommandMenu } = useCommandMenu();

  const {
    selectedNavigationMenuItemInEditMode,
    selectedItemLabel,
    selectedItem,
    selectedItemType,
    selectedItemObjectMetadata,
    processedItem,
    isFolderItem,
    isLinkItem,
    isObjectItem,
    isViewItem,
    objectIcon,
    getIcon,
  } = useSelectedNavigationMenuItemEditData();

  const [objectSearchInput, setObjectSearchInput] = useState('');
  const [systemObjectSearchInput, setSystemObjectSearchInput] = useState('');
  const [folderSearchInput, setFolderSearchInput] = useState('');
  const [viewSearchInput, setViewSearchInput] = useState('');
  const [
    selectedObjectMetadataIdForViewEdit,
    setSelectedObjectMetadataIdForViewEdit,
  ] = useState<string | null>(null);

  const {
    editSubView,
    setFolderPicker,
    setObjectPicker,
    setObjectPickerSystem,
    setViewPicker,
    clearSubView,
  } = useNavigationMenuItemEditSubView();

  const organizeActionsProps = useNavigationMenuItemEditOrganizeActions();

  const { allFolders, workspaceFolders, currentDraft } =
    useNavigationMenuItemEditFolderData();

  const {
    objectsForObjectPickerIncludingCurrent,
    objectsForViewEditObjectPicker,
    systemObjectsForObjectPicker,
    systemObjectsForViewEditObjectPicker,
  } = useNavigationMenuItemEditObjectPickerData(
    selectedItemObjectMetadata,
    selectedItem as ProcessedNavigationMenuItem | undefined,
    currentDraft ?? [],
  );

  const { updateObjectInDraft, updateViewInDraft, updateLinkInDraft } =
    useUpdateNavigationMenuItemsDraft();
  const { moveToFolder } = useNavigationMenuItemMoveRemove();
  const { objectMetadataItems } = useObjectMetadataItems();

  const handleChangeObject = (
    objectMetadataItem: ObjectMetadataItem,
    defaultViewId: string,
  ) => {
    if (isDefined(selectedNavigationMenuItemInEditMode)) {
      updateObjectInDraft(
        selectedNavigationMenuItemInEditMode,
        objectMetadataItem,
        defaultViewId,
      );
      clearSubView();
      closeCommandMenu();
    }
  };

  const handleSelectObjectForViewEdit = (
    objectMetadataItem: ObjectMetadataItem,
  ) => {
    setSelectedObjectMetadataIdForViewEdit(objectMetadataItem.id);
    setViewPicker();
  };

  const handleMoveToFolder = (folderId: string | null) => {
    if (isDefined(selectedNavigationMenuItemInEditMode)) {
      moveToFolder(selectedNavigationMenuItemInEditMode, folderId);
      clearSubView();
      closeCommandMenu();
    }
  };

  const handleChangeView = (view: View) => {
    if (isDefined(selectedNavigationMenuItemInEditMode)) {
      updateViewInDraft(selectedNavigationMenuItemInEditMode, view);
      setSelectedObjectMetadataIdForViewEdit(null);
      clearSubView();
      closeCommandMenu();
    }
  };

  const handleBackFromViewPicker = () => {
    if (isDefined(selectedObjectMetadataIdForViewEdit)) {
      setSelectedObjectMetadataIdForViewEdit(null);
      setObjectPicker();
    } else {
      clearSubView();
    }
  };

  const renderObjectMenuItem = (objectMetadataItem: ObjectMetadataItem) =>
    isViewItem ? (
      <SelectableListItem
        itemId={objectMetadataItem.id}
        onEnter={() => handleSelectObjectForViewEdit(objectMetadataItem)}
      >
        <CommandMenuItem
          Icon={getIcon(objectMetadataItem.icon)}
          label={objectMetadataItem.labelPlural}
          id={objectMetadataItem.id}
          onClick={() => handleSelectObjectForViewEdit(objectMetadataItem)}
        />
      </SelectableListItem>
    ) : (
      <CommandMenuObjectMenuItem
        objectMetadataItem={objectMetadataItem}
        onSelect={handleChangeObject}
        variant="edit"
      />
    );

  if (!selectedNavigationMenuItemInEditMode || !selectedItemLabel) {
    return (
      <StyledCommandMenuPageContainer>
        <StyledCommandMenuPlaceholder>
          {t`Select a navigation item to edit`}
        </StyledCommandMenuPlaceholder>
      </StyledCommandMenuPageContainer>
    );
  }

  if (editSubView === 'folder-picker') {
    const currentFolderId =
      selectedItemType === 'folder'
        ? selectedItem!.id
        : ((selectedItem as ProcessedNavigationMenuItem | undefined)
            ?.folderId ?? null);

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
        onBack={clearSubView}
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
        onBack={setObjectPicker}
        renderObjectMenuItem={renderObjectMenuItem}
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
        onBack={clearSubView}
        onOpenSystemPicker={setObjectPickerSystem}
        renderObjectMenuItem={renderObjectMenuItem}
        emptyNoResultsText={t`No objects available`}
      />
    );
  }

  if (editSubView === 'view-picker') {
    return (
      <CommandMenuEditViewPickerSubView
        currentDraft={currentDraft ?? []}
        selectedObjectMetadataIdForViewEdit={
          selectedObjectMetadataIdForViewEdit
        }
        selectedItemObjectMetadataId={
          selectedItemType === 'objectView'
            ? selectedItemObjectMetadata?.id
            : undefined
        }
        currentItemId={selectedNavigationMenuItemInEditMode}
        objectMetadataItems={objectMetadataItems}
        searchValue={viewSearchInput}
        onSearchChange={setViewSearchInput}
        onBack={handleBackFromViewPicker}
        onSelectView={handleChangeView}
      />
    );
  }

  const isObjectOrViewItem = isObjectItem || isViewItem;
  const objectViewBaseRender = () =>
    selectedItemObjectMetadata ? (
      <CommandMenuEditObjectViewBase
        objectIcon={objectIcon}
        objectLabel={selectedItemObjectMetadata.labelPlural ?? ''}
        onOpenObjectPicker={setObjectPicker}
        onOpenFolderPicker={setFolderPicker}
        viewRow={
          isViewItem && processedItem
            ? {
                icon: getIcon(processedItem.Icon ?? 'IconList'),
                label: processedItem.labelIdentifier ?? '',
                onClick: setViewPicker,
              }
            : undefined
        }
        canMoveUp={organizeActionsProps.canMoveUp}
        canMoveDown={organizeActionsProps.canMoveDown}
        onMoveUp={organizeActionsProps.onMoveUp}
        onMoveDown={organizeActionsProps.onMoveDown}
        onRemove={organizeActionsProps.onRemove}
      />
    ) : null;

  const mainViewConfig = [
    {
      condition: isObjectOrViewItem,
      render: objectViewBaseRender,
    },
    {
      condition: isLinkItem,
      render: () =>
        selectedItem ? (
          <CommandMenuEditLinkItemView
            selectedItem={selectedItem as ProcessedNavigationMenuItem}
            onUpdateLink={(linkId, link) => updateLinkInDraft(linkId, { link })}
            onOpenFolderPicker={setFolderPicker}
            canMoveUp={organizeActionsProps.canMoveUp}
            canMoveDown={organizeActionsProps.canMoveDown}
            onMoveUp={organizeActionsProps.onMoveUp}
            onMoveDown={organizeActionsProps.onMoveDown}
            onRemove={organizeActionsProps.onRemove}
          />
        ) : null,
    },
    {
      condition: isFolderItem,
      render: () => {
        const folderApplicationId = selectedItem
          ? currentDraft?.find((item) => item.id === selectedItem.id)
              ?.applicationId
          : undefined;
        return (
          <CommandMenuList
            commandGroups={[]}
            selectableItemIds={['move-up', 'move-down', 'remove']}
          >
            <CommandMenuEditOrganizeActions
              canMoveUp={organizeActionsProps.canMoveUp}
              canMoveDown={organizeActionsProps.canMoveDown}
              onMoveUp={organizeActionsProps.onMoveUp}
              onMoveDown={organizeActionsProps.onMoveDown}
              onRemove={organizeActionsProps.onRemove}
            />
            <CommandMenuEditOwnerSection applicationId={folderApplicationId} />
          </CommandMenuList>
        );
      },
    },
  ] as const;

  const matchingView = mainViewConfig.find((config) => config.condition);
  if (isDefined(matchingView)) {
    return matchingView.render();
  }

  return (
    <CommandMenuList
      commandGroups={[]}
      selectableItemIds={['move-up', 'move-down', 'move-to-folder', 'remove']}
    >
      <CommandMenuEditOrganizeActions
        canMoveUp={organizeActionsProps.canMoveUp}
        canMoveDown={organizeActionsProps.canMoveDown}
        onMoveUp={organizeActionsProps.onMoveUp}
        onMoveDown={organizeActionsProps.onMoveDown}
        onRemove={organizeActionsProps.onRemove}
        showMoveToFolder
        onMoveToFolder={setFolderPicker}
      />
    </CommandMenuList>
  );
};
