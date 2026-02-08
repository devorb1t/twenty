import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { CommandMenuEditFolderPickerSubView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditFolderPickerSubView';
import { CommandMenuEditLinkItemView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditLinkItemView';
import { CommandMenuEditObjectViewBase } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditObjectViewBase';
import { CommandMenuEditOrganizeActions } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditOrganizeActions';
import { CommandMenuEditOwnerSection } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditOwnerSection';
import { CommandMenuEditViewPickerSubView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditViewPickerSubView';
import { CommandMenuObjectPickerSubView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuObjectPickerSubView';
import { CommandMenuSystemObjectPickerSubView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuSystemObjectPickerSubView';
import { useNavigationMenuItemEditFolderData } from '@/command-menu/pages/navigation-menu-item/hooks/useNavigationMenuItemEditFolderData';
import { useNavigationMenuItemEditObjectPickerData } from '@/command-menu/pages/navigation-menu-item/hooks/useNavigationMenuItemEditObjectPickerData';
import { useNavigationMenuItemEditOrganizeActions } from '@/command-menu/pages/navigation-menu-item/hooks/useNavigationMenuItemEditOrganizeActions';
import { useNavigationMenuItemEditSubView } from '@/command-menu/pages/navigation-menu-item/hooks/useNavigationMenuItemEditSubView';
import { useSelectedNavigationMenuItemEditData } from '@/command-menu/pages/navigation-menu-item/hooks/useSelectedNavigationMenuItemEditData';
import { useUpdateNavigationMenuItemsDraft } from '@/navigation-menu-item/hooks/useUpdateNavigationMenuItemsDraft';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { useGetStandardObjectIcon } from '@/object-metadata/hooks/useGetStandardObjectIcon';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

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

  const selectedNavigationMenuItemInEditMode = useRecoilValue(
    selectedNavigationMenuItemInEditModeState,
  );
  const {
    selectedItemLabel,
    selectedItem,
    selectedItemObjectMetadata,
    processedItem,
    isFolderItem,
    isLinkItem,
    isObjectItem,
    isViewItem,
  } = useSelectedNavigationMenuItemEditData();
  const { getIcon } = useIcons();
  const objectNameSingular = selectedItemObjectMetadata?.nameSingular ?? '';
  const { Icon: StandardObjectIcon } =
    useGetStandardObjectIcon(objectNameSingular);
  const objectIcon =
    StandardObjectIcon ??
    getIcon(selectedItemObjectMetadata?.icon ?? 'IconCube');

  const [objectSearchInput, setObjectSearchInput] = useState('');
  const [systemObjectSearchInput, setSystemObjectSearchInput] = useState('');
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

  const { canMoveUp, canMoveDown, onMoveUp, onMoveDown, onRemove } =
    useNavigationMenuItemEditOrganizeActions();

  const { currentDraft } = useNavigationMenuItemEditFolderData();

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

  const { updateObjectInDraft, updateLinkInDraft } =
    useUpdateNavigationMenuItemsDraft();
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

  const handleBackFromViewPicker = () => {
    if (isDefined(selectedObjectMetadataIdForViewEdit)) {
      setSelectedObjectMetadataIdForViewEdit(null);
      setObjectPicker();
    } else {
      clearSubView();
    }
  };

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
    return <CommandMenuEditFolderPickerSubView onBack={clearSubView} />;
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
        isViewItem={isViewItem}
        onSelectObjectForViewEdit={handleSelectObjectForViewEdit}
        onChangeObject={handleChangeObject}
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
        isViewItem={isViewItem}
        onSelectObjectForViewEdit={handleSelectObjectForViewEdit}
        onChangeObject={handleChangeObject}
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
        objectMetadataItems={objectMetadataItems}
        searchValue={viewSearchInput}
        onSearchChange={setViewSearchInput}
        onBack={handleBackFromViewPicker}
        onClearObjectMetadataForViewEdit={() =>
          setSelectedObjectMetadataIdForViewEdit(null)
        }
      />
    );
  }

  const mainViewConfig = [
    {
      condition: isObjectItem || isViewItem,
      render: () =>
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
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onRemove={onRemove}
          />
        ) : null,
    },
    {
      condition: isLinkItem,
      render: () =>
        selectedItem ? (
          <CommandMenuEditLinkItemView
            selectedItem={selectedItem as ProcessedNavigationMenuItem}
            onUpdateLink={(linkId, link) => updateLinkInDraft(linkId, { link })}
            onOpenFolderPicker={setFolderPicker}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onRemove={onRemove}
          />
        ) : null,
    },
    {
      condition: isFolderItem,
      render: () => (
        <CommandMenuList
          commandGroups={[]}
          selectableItemIds={['move-up', 'move-down', 'remove']}
        >
          <CommandMenuEditOrganizeActions
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onRemove={onRemove}
          />
          <CommandMenuEditOwnerSection />
        </CommandMenuList>
      ),
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
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onRemove={onRemove}
        showMoveToFolder
        onMoveToFolder={setFolderPicker}
      />
    </CommandMenuList>
  );
};
