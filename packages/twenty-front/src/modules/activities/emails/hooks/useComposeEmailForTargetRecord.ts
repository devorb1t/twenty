import { useFirstConnectedAccount } from '@/activities/emails/hooks/useFirstConnectedAccount';
import { useResolveDefaultEmailRecipient } from '@/activities/emails/hooks/useResolveDefaultEmailRecipient';
import { useOpenComposeEmailInSidePanel } from '@/side-panel/hooks/useOpenComposeEmailInSidePanel';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

// Wires the compose-email side panel to the record currently shown in the
// page (Person, Company or Opportunity). Used by both the inbox header `+`
// button and the empty-inbox CTA so they stay in sync.
export const useComposeEmailForTargetRecord = () => {
  const targetRecord = useTargetRecord();
  const { openComposeEmailInSidePanel } = useOpenComposeEmailInSidePanel();
  const navigateSettings = useNavigateSettings();
  const { connectedAccountId, loading: accountLoading } =
    useFirstConnectedAccount();

  const { defaultTo, loading: recipientLoading } =
    useResolveDefaultEmailRecipient({
      objectNameSingular: targetRecord.targetObjectNameSingular,
      recordId: targetRecord.id,
    });

  const openComposer = () => {
    if (!isDefined(connectedAccountId)) {
      navigateSettings(SettingsPath.NewAccount);

      return;
    }

    openComposeEmailInSidePanel({
      connectedAccountId,
      defaultTo,
    });
  };

  return {
    openComposer,
    loading: accountLoading || recipientLoading,
  };
};
