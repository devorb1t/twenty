import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { IconLink } from 'twenty-ui/display';

import { CommandMenuPageInfoLayout } from '@/command-menu/components/CommandMenuPageInfoLayout';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { commandMenuShouldFocusTitleInputComponentState } from '@/command-menu/states/commandMenuShouldFocusTitleInputComponentState';
import { useUpdateNavigationMenuItemsDraft } from '@/navigation-menu-item/hooks/useUpdateNavigationMenuItemsDraft';
import {
  type WorkspaceSectionItem,
  useWorkspaceSectionItems,
} from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { getNavigationMenuItemIconColors } from '@/navigation-menu-item/utils/getNavigationMenuItemIconColors';
import { TitleInput } from '@/ui/input/components/TitleInput';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';

const StyledLinkIcon = styled.div`
  align-items: center;
  background-color: ${({ theme }) =>
    getNavigationMenuItemIconColors(theme).link};
  border-radius: ${({ theme }) => theme.border.radius.xs};
  display: flex;
  height: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  width: ${({ theme }) => theme.spacing(4)};
`;

const getWorkspaceSectionItemId = (item: WorkspaceSectionItem): string =>
  item.type === 'folder' ? item.folder.folderId : item.navigationMenuItem.id;

export const CommandMenuLinkInfo = () => {
  const theme = useTheme();
  const { t } = useLingui();
  const commandMenuPageInfo = useRecoilValue(commandMenuPageInfoState);
  const [shouldFocusTitleInput, setShouldFocusTitleInput] =
    useRecoilComponentState(
      commandMenuShouldFocusTitleInputComponentState,
      commandMenuPageInfo.instanceId,
    );
  const selectedNavigationMenuItemInEditMode = useRecoilValue(
    selectedNavigationMenuItemInEditModeState,
  );
  const workspaceSectionItems = useWorkspaceSectionItems();
  const { updateLinkInDraft } = useUpdateNavigationMenuItemsDraft();

  const selectedLink = workspaceSectionItems.find(
    (item) =>
      item.type === 'link' &&
      getWorkspaceSectionItemId(item) === selectedNavigationMenuItemInEditMode,
  );

  if (
    !selectedLink ||
    selectedLink.type !== 'link' ||
    !selectedNavigationMenuItemInEditMode
  ) {
    return null;
  }

  const linkId = selectedLink.navigationMenuItem.id;
  const linkLabel = selectedLink.navigationMenuItem.name ?? t`Link label`;

  const handleChange = (text: string) => {
    updateLinkInDraft(linkId, { name: text });
  };

  const saveLinkLabel = () => {
    const trimmed = linkLabel.trim();
    const finalLabel = trimmed.length > 0 ? trimmed : t`Link label`;
    if (finalLabel !== linkLabel) {
      updateLinkInDraft(linkId, { name: finalLabel });
    }
  };

  return (
    <CommandMenuPageInfoLayout
      icon={
        <StyledLinkIcon>
          <IconLink
            size={theme.spacing(3)}
            color={theme.grayScale.gray1}
            stroke={theme.icon.stroke.md}
          />
        </StyledLinkIcon>
      }
      title={
        <TitleInput
          instanceId={`link-label-${linkId}`}
          sizeVariant="sm"
          value={linkLabel}
          onChange={handleChange}
          placeholder={t`Link label`}
          onEnter={saveLinkLabel}
          onEscape={saveLinkLabel}
          onClickOutside={saveLinkLabel}
          onTab={saveLinkLabel}
          onShiftTab={saveLinkLabel}
          shouldFocus={shouldFocusTitleInput}
          onFocus={() => setShouldFocusTitleInput(false)}
        />
      }
      label={t`link`}
    />
  );
};
