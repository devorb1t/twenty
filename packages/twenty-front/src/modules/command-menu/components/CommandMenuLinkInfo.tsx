import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { IconLink } from 'twenty-ui/display';

import { CommandMenuNavigationMenuItemIcon } from '@/command-menu/components/CommandMenuNavigationMenuItemIcon';
import { CommandMenuPageInfoLayout } from '@/command-menu/components/CommandMenuPageInfoLayout';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { commandMenuShouldFocusTitleInputComponentState } from '@/command-menu/states/commandMenuShouldFocusTitleInputComponentState';
import { useFlattenedWorkspaceSectionItemsForLookup } from '@/navigation-menu-item/hooks/useFlattenedWorkspaceSectionItemsForLookup';
import { useUpdateNavigationMenuItemsDraft } from '@/navigation-menu-item/hooks/useUpdateNavigationMenuItemsDraft';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { TitleInput } from '@/ui/input/components/TitleInput';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';

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
  const workspaceSectionItems = useFlattenedWorkspaceSectionItemsForLookup();
  const { updateLinkInDraft } = useUpdateNavigationMenuItemsDraft();

  const selectedLink = workspaceSectionItems.find(
    (item) =>
      item.type === 'link' && item.id === selectedNavigationMenuItemInEditMode,
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
        <CommandMenuNavigationMenuItemIcon colorKey="link">
          <IconLink
            size={theme.spacing(3)}
            color={theme.grayScale.gray1}
            stroke={theme.icon.stroke.md}
          />
        </CommandMenuNavigationMenuItemIcon>
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
