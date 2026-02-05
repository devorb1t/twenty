import { useLingui } from '@lingui/react/macro';
import { IconApps, IconRefresh } from 'twenty-ui/display';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

export const CommandMenuEditOwnerSection = () => {
  const { t } = useLingui();

  return (
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
  );
};
