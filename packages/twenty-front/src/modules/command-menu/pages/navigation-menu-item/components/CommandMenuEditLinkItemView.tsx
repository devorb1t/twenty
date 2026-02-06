import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { CommandMenuEditOrganizeActions } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditOrganizeActions';
import { CommandMenuEditOwnerSection } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditOwnerSection';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { TextInput } from '@/ui/input/components/TextInput';

type CommandMenuEditLinkItemViewProps = {
  selectedItem: ProcessedNavigationMenuItem;
  onUpdateLink: (linkId: string, link: string) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onOpenFolderPicker: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
};

export const CommandMenuEditLinkItemView = ({
  selectedItem,
  onUpdateLink,
  canMoveUp,
  canMoveDown,
  onOpenFolderPicker,
  onMoveUp,
  onMoveDown,
  onRemove,
}: CommandMenuEditLinkItemViewProps) => {
  const { t } = useLingui();
  const [urlEditInput, setUrlEditInput] = useState('');
  const linkUrl = selectedItem.link ?? '';
  const linkId = selectedItem.id;

  const selectableItemIds = [
    'move-up',
    'move-down',
    'move-to-folder',
    'remove',
  ];

  return (
    <CommandMenuList commandGroups={[]} selectableItemIds={selectableItemIds}>
      <CommandGroup heading={t`Customize`}>
        <TextInput
          fullWidth
          placeholder="www.google.com"
          value={urlEditInput || linkUrl}
          onChange={(value) => setUrlEditInput(value)}
          onBlur={(event) => {
            const value = event.target.value.trim();
            if (isNonEmptyString(value)) {
              const normalizedLink =
                value.startsWith('http://') || value.startsWith('https://')
                  ? value
                  : `https://${value}`;
              onUpdateLink(linkId, normalizedLink);
              setUrlEditInput('');
            }
          }}
        />
      </CommandGroup>
      <CommandMenuEditOrganizeActions
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onRemove={onRemove}
        showMoveToFolder={true}
        onMoveToFolder={onOpenFolderPicker}
        moveToFolderHasSubMenu={true}
      />
      <CommandMenuEditOwnerSection applicationId={selectedItem.applicationId} />
    </CommandMenuList>
  );
};
