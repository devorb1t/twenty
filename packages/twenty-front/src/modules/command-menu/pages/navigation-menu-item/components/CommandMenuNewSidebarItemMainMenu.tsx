import { useLingui } from '@lingui/react/macro';
import {
  IconAddressBook,
  IconCube,
  IconFolder,
  IconLink,
  IconList,
} from 'twenty-ui/display';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuItemWithAddToNavigationDrag } from '@/command-menu/components/CommandMenuItemWithAddToNavigationDrag';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type CommandMenuNewSidebarItemMainMenuProps = {
  onSelectObject: () => void;
  onSelectView: () => void;
  onSelectRecord: () => void;
  onAddFolder: () => void;
  onAddLink: () => void;
};

export const CommandMenuNewSidebarItemMainMenu = ({
  onSelectObject,
  onSelectView,
  onSelectRecord,
  onAddFolder,
  onAddLink,
}: CommandMenuNewSidebarItemMainMenuProps) => {
  const { t } = useLingui();

  return (
    <CommandMenuList
      commandGroups={[]}
      selectableItemIds={['object', 'view', 'record', 'folder', 'link']}
    >
      <CommandGroup heading={t`Data`}>
        <SelectableListItem itemId="object" onEnter={onSelectObject}>
          <CommandMenuItem
            Icon={IconCube}
            label={t`Object`}
            id="object"
            hasSubMenu={true}
            onClick={onSelectObject}
          />
        </SelectableListItem>
        <SelectableListItem itemId="view" onEnter={onSelectView}>
          <CommandMenuItem
            Icon={IconList}
            label={t`View`}
            id="view"
            hasSubMenu={true}
            onClick={onSelectView}
          />
        </SelectableListItem>
        <SelectableListItem itemId="record" onEnter={onSelectRecord}>
          <CommandMenuItem
            Icon={IconAddressBook}
            label={t`Record`}
            id="record"
            hasSubMenu={true}
            onClick={onSelectRecord}
          />
        </SelectableListItem>
      </CommandGroup>
      <CommandGroup heading={t`Other`}>
        <SelectableListItem itemId="folder" onEnter={onAddFolder}>
          <CommandMenuItemWithAddToNavigationDrag
            Icon={IconFolder}
            label={t`Folder`}
            id="folder"
            onClick={onAddFolder}
            payload={{
              type: 'folder',
              folderId: 'new',
              name: t`New folder`,
            }}
          />
        </SelectableListItem>
        <SelectableListItem itemId="link" onEnter={onAddLink}>
          <CommandMenuItemWithAddToNavigationDrag
            Icon={IconLink}
            label={t`Link`}
            id="link"
            onClick={onAddLink}
            payload={{
              type: 'link',
              linkId: 'new',
              name: t`Link label`,
              link: 'https://www.example.com',
            }}
          />
        </SelectableListItem>
      </CommandGroup>
    </CommandMenuList>
  );
};
