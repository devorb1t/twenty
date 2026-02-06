import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { IconLink } from 'twenty-ui/display';

import { CommandMenuNavigationMenuItemIcon } from '@/command-menu/components/CommandMenuNavigationMenuItemIcon';
import { CommandMenuPageInfoLayout } from '@/command-menu/components/CommandMenuPageInfoLayout';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { commandMenuShouldFocusTitleInputComponentState } from '@/command-menu/states/commandMenuShouldFocusTitleInputComponentState';
import { useWorkspaceSectionItems } from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { useUpdateNavigationMenuItemsDraft } from '@/navigation-menu-item/hooks/useUpdateNavigationMenuItemsDraft';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { getNavigationMenuItemType } from '@/navigation-menu-item/utils/getNavigationMenuItemType';
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
  const selectedId = useRecoilValue(
    selectedNavigationMenuItemInEditModeState,
  );
  const items = useWorkspaceSectionItems();
  const { updateLinkInDraft } = useUpdateNavigationMenuItemsDraft();

  const selectedLink = selectedId
    ? items.find(
        (item) =>
          getNavigationMenuItemType(item) === 'link' && item.id === selectedId,
      )
    : undefined;

  if (!selectedLink) return null;

  const linkId = selectedLink.id;
  const linkLabel = selectedLink.name ?? t`Link label`;
  const defaultLabel = t`Link label`;

  const handleChange = (text: string) => {
    updateLinkInDraft(linkId, { name: text });
  };

  const handleSave = () => {
    const trimmed = linkLabel.trim();
    const finalLabel = trimmed.length > 0 ? trimmed : defaultLabel;
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
          onEnter={handleSave}
          onEscape={handleSave}
          onClickOutside={handleSave}
          onTab={handleSave}
          onShiftTab={handleSave}
          shouldFocus={shouldFocusTitleInput}
          onFocus={() => setShouldFocusTitleInput(false)}
        />
      }
      label={t`link`}
    />
  );
};
