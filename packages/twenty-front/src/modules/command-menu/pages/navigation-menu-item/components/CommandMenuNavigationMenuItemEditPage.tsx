import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { CommandMenuEditFolderPickerSubView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditFolderPickerSubView';
import { CommandMenuEditLinkItemView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditLinkItemView';
import { CommandMenuEditObjectViewBase } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditObjectViewBase';
import { CommandMenuEditOrganizeActions } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditOrganizeActions';
import { CommandMenuEditOwnerSection } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditOwnerSection';
import { useNavigationMenuItemEditOrganizeActions } from '@/command-menu/pages/navigation-menu-item/hooks/useNavigationMenuItemEditOrganizeActions';
import { useNavigationMenuItemEditSubView } from '@/command-menu/pages/navigation-menu-item/hooks/useNavigationMenuItemEditSubView';
import { useSelectedNavigationMenuItemEditData } from '@/command-menu/pages/navigation-menu-item/hooks/useSelectedNavigationMenuItemEditData';
import { useUpdateLinkInDraft } from '@/navigation-menu-item/hooks/useUpdateLinkInDraft';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';

const StyledCommandMenuPlaceholder = styled.p`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledCommandMenuPageContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(3)};
`;

export const CommandMenuNavigationMenuItemEditPage = () => {
  const { t } = useLingui();

  const selectedNavigationMenuItemInEditMode = useRecoilValue(
    selectedNavigationMenuItemInEditModeState,
  );
  const {
    selectedItemLabel,
    selectedItem,
    selectedItemObjectMetadata,
    selectedItemType,
  } = useSelectedNavigationMenuItemEditData();

  const { editSubView, setFolderPicker, clearSubView } =
    useNavigationMenuItemEditSubView();

  const {
    canMoveUp,
    canMoveDown,
    onMoveUp,
    onMoveDown,
    onRemove,
    onAddBefore,
    onAddAfter,
  } = useNavigationMenuItemEditOrganizeActions();

  const { updateLinkInDraft } = useUpdateLinkInDraft();

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

  if (selectedItemType === 'view' && !selectedItemObjectMetadata) {
    return null;
  }

  if (selectedItemType === 'view') {
    return (
      <CommandMenuEditObjectViewBase
        onOpenFolderPicker={setFolderPicker}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onRemove={onRemove}
        onAddBefore={onAddBefore}
        onAddAfter={onAddAfter}
      />
    );
  }

  if (selectedItemType === 'link' && !selectedItem) {
    return null;
  }

  if (selectedItemType === 'link') {
    return (
      <CommandMenuEditLinkItemView
        selectedItem={selectedItem as ProcessedNavigationMenuItem}
        onUpdateLink={(linkId, link) => updateLinkInDraft(linkId, { link })}
        onOpenFolderPicker={setFolderPicker}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onRemove={onRemove}
        onAddBefore={onAddBefore}
        onAddAfter={onAddAfter}
      />
    );
  }

  if (selectedItemType === 'folder') {
    return (
      <CommandMenuList
        commandGroups={[]}
        selectableItemIds={[
          'move-up',
          'move-down',
          'add-before',
          'add-after',
          'remove',
        ]}
      >
        <CommandMenuEditOrganizeActions
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onRemove={onRemove}
          onAddBefore={onAddBefore}
          onAddAfter={onAddAfter}
        />
        <CommandMenuEditOwnerSection />
      </CommandMenuList>
    );
  }

  return (
    <CommandMenuList
      commandGroups={[]}
      selectableItemIds={[
        'move-up',
        'move-down',
        'move-to-folder',
        'add-before',
        'add-after',
        'remove',
      ]}
    >
      <CommandMenuEditOrganizeActions
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onRemove={onRemove}
        onAddBefore={onAddBefore}
        onAddAfter={onAddAfter}
        showMoveToFolder
        onMoveToFolder={setFolderPicker}
      />
    </CommandMenuList>
  );
};
