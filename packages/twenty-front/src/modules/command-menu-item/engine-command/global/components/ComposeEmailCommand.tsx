import { useFirstConnectedAccount } from '@/activities/emails/hooks/useFirstConnectedAccount';
import { useResolveDefaultEmailRecipient } from '@/activities/emails/hooks/useResolveDefaultEmailRecipient';
import { getPrimaryEmailFromRecord } from '@/activities/emails/utils/getPrimaryEmailFromRecord';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useOpenComposeEmailInSidePanel } from '@/side-panel/hooks/useOpenComposeEmailInSidePanel';
import { CoreObjectNameSingular, SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

// Resolves the default `to` for a bulk Person selection by reading the primary
// email from each selected record (if loaded into the record store) and joining
// them with commas. Records without an email are skipped.
const buildBulkPersonRecipientList = (
  selectedRecords: ObjectRecord[],
): string =>
  selectedRecords.map(getPrimaryEmailFromRecord).filter(isDefined).join(', ');

export const ComposeEmailCommand = () => {
  const { connectedAccountId, loading: accountLoading } =
    useFirstConnectedAccount();
  const { openComposeEmailInSidePanel } = useOpenComposeEmailInSidePanel();
  const navigateSettings = useNavigateSettings();

  const { objectMetadataItem, selectedRecords } =
    useHeadlessCommandContextApi();

  const objectNameSingular = objectMetadataItem?.nameSingular ?? null;
  const isPersonBulk =
    objectNameSingular === CoreObjectNameSingular.Person &&
    selectedRecords.length > 1;

  // For single-record selection we use the shared resolver (which handles the
  // per-object-type fetching). For bulk Person we read from the selected
  // records directly. For global invocations we leave the recipient empty.
  const singleSelectedRecordId = !isPersonBulk
    ? (selectedRecords[0]?.id ?? null)
    : null;

  const { defaultTo: singleDefaultTo, loading: recipientLoading } =
    useResolveDefaultEmailRecipient({
      objectNameSingular,
      recordId: singleSelectedRecordId,
    });

  const defaultTo = isPersonBulk
    ? buildBulkPersonRecipientList(selectedRecords)
    : singleDefaultTo;

  const handleExecute = () => {
    if (!isDefined(connectedAccountId)) {
      navigateSettings(SettingsPath.NewAccount);

      return;
    }

    openComposeEmailInSidePanel({
      connectedAccountId,
      defaultTo,
    });
  };

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={handleExecute}
      ready={!accountLoading && !recipientLoading}
    />
  );
};
