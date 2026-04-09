import { useOpenEmailInAppOrFallback } from '@/activities/emails/hooks/useOpenEmailInAppOrFallback';
import { useEmailsFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useEmailsFieldDisplay';
import { EmailsDisplay } from '@/ui/field/display/components/EmailsDisplay';
import { useLingui } from '@lingui/react/macro';
import React from 'react';
import { FieldMetadataSettingsOnClickAction } from 'twenty-shared/types';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

export const EmailsFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useEmailsFieldDisplay();
  const { copyToClipboard } = useCopyToClipboard();
  const { openEmail } = useOpenEmailInAppOrFallback();
  const { t } = useLingui();

  // Email fields default to opening the in-app composer when no setting is
  // explicitly stored. The mailto-based <a> stays as the rendered href so the
  // link is still right-clickable / openable in a new tab.
  const onClickAction =
    fieldDefinition.metadata.settings?.clickAction ??
    FieldMetadataSettingsOnClickAction.OPEN_IN_APP;

  const handleEmailClick = (
    email: string,
    event: React.MouseEvent<HTMLElement>,
  ) => {
    if (onClickAction === FieldMetadataSettingsOnClickAction.COPY) {
      event.preventDefault();
      copyToClipboard(email, t`Email copied to clipboard`);

      return;
    }

    if (onClickAction === FieldMetadataSettingsOnClickAction.OPEN_IN_APP) {
      event.preventDefault();
      openEmail(email);
    }
  };

  return <EmailsDisplay value={fieldValue} onEmailClick={handleEmailClick} />;
};
