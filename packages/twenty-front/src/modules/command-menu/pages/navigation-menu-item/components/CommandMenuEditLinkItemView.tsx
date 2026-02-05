import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { IconApps, IconRefresh } from 'twenty-ui/display';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { CommandMenuEditOrganizeActions } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuEditOrganizeActions';
import type { WorkspaceSectionItem } from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { TextInput } from '@/ui/input/components/TextInput';

type LinkItem = WorkspaceSectionItem & { type: 'link' };

type CommandMenuEditLinkItemViewProps = {
  selectedItem: LinkItem;
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
  const linkUrl = selectedItem.navigationMenuItem.link ?? '';
  const linkId = selectedItem.navigationMenuItem.id;

  const selectableItemIds = [
    'move-up',
    'move-down',
    'move-to-folder',
    'remove',
    'standard-app',
    'reset-to-default',
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
      <CommandGroup heading={t`Owner`}>
        <SelectableListItem itemId="standard-app" onEnter={() => {}}>
          <CommandMenuItem
            Icon={IconApps}
            label={t`Standard app`}
            id="standard-app"
            disabled={true}
            onClick={() => {}}
          />
        </SelectableListItem>
        <SelectableListItem itemId="reset-to-default" onEnter={() => {}}>
          <CommandMenuItem
            Icon={IconRefresh}
            label={t`Reset to default`}
            id="reset-to-default"
            disabled={true}
            onClick={() => {}}
          />
        </SelectableListItem>
      </CommandGroup>
    </CommandMenuList>
  );
};
