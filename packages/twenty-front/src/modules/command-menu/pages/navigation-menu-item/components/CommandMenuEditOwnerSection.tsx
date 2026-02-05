import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconApps } from 'twenty-ui/display';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useFindOneApplicationQuery } from '~/generated-metadata/graphql';

type CommandMenuEditOwnerSectionProps = {
  applicationId?: string | null;
};

export const CommandMenuEditOwnerSection = ({
  applicationId,
}: CommandMenuEditOwnerSectionProps) => {
  const { t } = useLingui();

  const { data } = useFindOneApplicationQuery({
    variables: { id: applicationId ?? '' },
    skip: !isDefined(applicationId),
  });

  const applicationName = data?.findOneApplication?.name;
  const ownerLabel = isDefined(applicationName)
    ? applicationName
    : t`Standard app`;

  return (
    <CommandGroup heading={t`Owner`}>
      <SelectableListItem itemId="owner-app" onEnter={() => {}}>
        <CommandMenuItem
          Icon={IconApps}
          label={ownerLabel}
          id="owner-app"
          disabled={true}
          onClick={() => {}}
        />
      </SelectableListItem>
    </CommandGroup>
  );
};
