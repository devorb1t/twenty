import { CommandMenuFolderInfo } from '@/command-menu/components/CommandMenuFolderInfo';
import { CommandMenuLinkInfo } from './CommandMenuLinkInfo';
import { CommandMenuMultipleRecordsInfo } from '@/command-menu/components/CommandMenuMultipleRecordsInfo';
import { CommandMenuPageLayoutInfo } from '@/command-menu/components/CommandMenuPageLayoutInfo';
import { CommandMenuRecordInfo } from '@/command-menu/components/CommandMenuRecordInfo';
import { CommandMenuWorkflowStepInfo } from '@/command-menu/components/CommandMenuWorkflowStepInfo';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import {
  type WorkspaceSectionItem,
  useWorkspaceSectionItems,
} from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';
import { type CommandMenuContextChipProps } from './CommandMenuContextChip';

const StyledPageTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

type CommandMenuPageInfoProps = {
  pageChip: CommandMenuContextChipProps | undefined;
};

const getWorkspaceSectionItemId = (item: WorkspaceSectionItem): string =>
  item.type === 'folder' ? item.folder.folderId : item.navigationMenuItem.id;

export const CommandMenuPageInfo = ({ pageChip }: CommandMenuPageInfoProps) => {
  const selectedNavigationMenuItemInEditMode = useRecoilValue(
    selectedNavigationMenuItemInEditModeState,
  );
  const workspaceSectionItems = useWorkspaceSectionItems();

  if (!isDefined(pageChip)) {
    return null;
  }

  const isNavigationMenuItemEditPage =
    pageChip.page?.page === CommandMenuPages.NavigationMenuItemEdit;
  const selectedFolder = isNavigationMenuItemEditPage
    ? workspaceSectionItems.find(
        (item) =>
          item.type === 'folder' &&
          getWorkspaceSectionItemId(item) ===
            selectedNavigationMenuItemInEditMode,
      )
    : undefined;
  const selectedLink = isNavigationMenuItemEditPage
    ? workspaceSectionItems.find(
        (item) =>
          item.type === 'link' &&
          getWorkspaceSectionItemId(item) ===
            selectedNavigationMenuItemInEditMode,
      )
    : undefined;

  if (isNavigationMenuItemEditPage && selectedFolder?.type === 'folder') {
    return <CommandMenuFolderInfo />;
  }

  if (isNavigationMenuItemEditPage && selectedLink?.type === 'link') {
    return <CommandMenuLinkInfo />;
  }

  const isRecordPage = pageChip.page?.page === CommandMenuPages.ViewRecord;

  if (isRecordPage && isDefined(pageChip.page?.pageId)) {
    return (
      <CommandMenuRecordInfo commandMenuPageInstanceId={pageChip.page.pageId} />
    );
  }

  const isWorkflowStepPage = pageChip.page?.page
    ? [
        CommandMenuPages.WorkflowStepEdit,
        CommandMenuPages.WorkflowStepView,
        CommandMenuPages.WorkflowRunStepView,
      ].includes(pageChip.page?.page)
    : false;

  if (isWorkflowStepPage && isDefined(pageChip.page?.pageId)) {
    return (
      <CommandMenuWorkflowStepInfo
        key={pageChip.page.pageId}
        commandMenuPageInstanceId={pageChip.page.pageId}
      />
    );
  }

  const isPageLayoutPage = pageChip.page?.page
    ? [
        CommandMenuPages.PageLayoutWidgetTypeSelect,
        CommandMenuPages.PageLayoutGraphTypeSelect,
        CommandMenuPages.PageLayoutGraphFilter,
        CommandMenuPages.PageLayoutIframeSettings,
        CommandMenuPages.PageLayoutTabSettings,
        CommandMenuPages.PageLayoutFieldsSettings,
        CommandMenuPages.PageLayoutFieldsLayout,
      ].includes(pageChip.page?.page)
    : false;

  if (isPageLayoutPage) {
    return <CommandMenuPageLayoutInfo />;
  }

  const isMultipleRecordsPage =
    pageChip.page?.page === CommandMenuPages.UpdateRecords;

  if (isMultipleRecordsPage && isDefined(pageChip.page?.pageId)) {
    return (
      <CommandMenuMultipleRecordsInfo
        commandMenuPageInstanceId={pageChip.page.pageId}
      />
    );
  }

  return (
    <StyledPageTitle>
      <OverflowingTextWithTooltip text={pageChip.text ?? ''} />
    </StyledPageTitle>
  );
};
