import { isDefined } from 'twenty-shared/utils';
import { type ApplicationDataTableRow } from '~/pages/settings/applications/components/SettingsApplicationDataTable';

export type ItemTagInfo = (
  | ThisAppItemTagInfo
  | StandardItemTagInfo
  | CustomItemTagInfo
  | RemoteItemTagInfo
  | ManagedItemTagInfo
) & { logoUrl?: string };

type ThisAppItemTagInfo = {
  labelText: 'This app';
  labelColor: 'sky';
};

type StandardItemTagInfo = {
  labelText: 'Standard';
  labelColor: 'blue';
};

type CustomItemTagInfo = {
  labelText: 'Custom';
  labelColor: 'orange';
};

type RemoteItemTagInfo = {
  labelText: 'Remote';
  labelColor: 'green';
};

type ManagedItemTagInfo = {
  labelText: 'Managed';
  labelColor: 'sky';
};

export const getItemTagInfo = ({
  item: { isCustom, isRemote, applicationId, logoUrl },
  workspaceCustomApplicationId,
  currentApplicationId,
}: {
  item: ApplicationDataTableRow['tagItem'];
  workspaceCustomApplicationId?: string;
  currentApplicationId?: string;
}): ItemTagInfo => {
  if (
    isDefined(applicationId) &&
    isDefined(currentApplicationId) &&
    applicationId === currentApplicationId
  ) {
    return {
      labelText: 'This app',
      labelColor: 'sky',
      logoUrl: logoUrl ?? undefined,
    };
  }

  if (
    isDefined(applicationId) &&
    applicationId !== workspaceCustomApplicationId
  ) {
    return { labelText: 'Managed', labelColor: 'sky' };
  }

  if (isCustom!!) {
    return { labelText: 'Custom', labelColor: 'orange' };
  }

  if (isRemote!!) {
    return { labelText: 'Remote', labelColor: 'green' };
  }

  return { labelText: 'Standard', labelColor: 'blue' };
};
