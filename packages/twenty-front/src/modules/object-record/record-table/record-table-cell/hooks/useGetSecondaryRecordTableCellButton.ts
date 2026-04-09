import { useOpenEmailInAppOrFallback } from '@/activities/emails/hooks/useOpenEmailInAppOrFallback';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import {
  type FieldEmailsValue,
  type FieldLinksValue,
  type FieldPhonesValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldEmails } from '@/object-record/record-field/ui/types/guards/isFieldEmails';
import { isFieldLinks } from '@/object-record/record-field/ui/types/guards/isFieldLinks';
import { isFieldPhones } from '@/object-record/record-field/ui/types/guards/isFieldPhones';
import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { FieldMetadataSettingsOnClickAction } from 'twenty-shared/types';
import { ensureAbsoluteUrl, isDefined } from 'twenty-shared/utils';
import { IconArrowUpRight, IconCopy, IconMail } from 'twenty-ui/display';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

export const useGetSecondaryRecordTableCellButton = () => {
  const { fieldDefinition, recordId } = useContext(FieldContext);
  const { copyToClipboard } = useCopyToClipboard();
  const { openEmail } = useOpenEmailInAppOrFallback();

  const fieldValue = useRecordFieldValue<
    FieldPhonesValue | FieldEmailsValue | FieldLinksValue | undefined
  >(recordId, fieldDefinition.metadata.fieldName, fieldDefinition);

  if (
    (!isFieldPhones(fieldDefinition) &&
      !isFieldLinks(fieldDefinition) &&
      !isFieldEmails(fieldDefinition)) ||
    !isDefined(fieldValue)
  ) {
    return [];
  }

  // Email fields default to opening the in-app composer; other field types
  // default to opening the platform link handler.
  const isEmailField = isFieldEmails(fieldDefinition);
  const defaultClickAction = isEmailField
    ? FieldMetadataSettingsOnClickAction.OPEN_IN_APP
    : FieldMetadataSettingsOnClickAction.OPEN_LINK;

  const mainActionOnClick =
    fieldDefinition.metadata.settings?.clickAction ?? defaultClickAction;

  // The secondary button always exposes the "other" useful action: if main is
  // a copy then offer an open action, otherwise offer copy. For emails the
  // open action is the in-app composer rather than mailto.
  const openActionForFieldType = isEmailField
    ? FieldMetadataSettingsOnClickAction.OPEN_IN_APP
    : FieldMetadataSettingsOnClickAction.OPEN_LINK;

  const secondaryActionOnClick =
    mainActionOnClick === FieldMetadataSettingsOnClickAction.COPY
      ? openActionForFieldType
      : FieldMetadataSettingsOnClickAction.COPY;

  let openLinkOnClick: () => void = () => {};
  let copyOnClick: () => void = () => {};
  let openInAppOnClick: () => void = () => {};

  if (isFieldPhones(fieldDefinition)) {
    const { primaryPhoneCallingCode = '', primaryPhoneNumber = '' } =
      fieldValue as FieldPhonesValue;
    const phoneNumber = `${primaryPhoneCallingCode}${primaryPhoneNumber}`;
    openLinkOnClick = () => {
      window.open(`tel:${phoneNumber}`, '_blank');
    };
    copyOnClick = () => {
      copyToClipboard(phoneNumber, t`Phone number copied to clipboard`);
    };
  }

  if (isFieldEmails(fieldDefinition)) {
    const email = (fieldValue as FieldEmailsValue).primaryEmail ?? '';
    openLinkOnClick = () => {
      window.open(`mailto:${email}`, '_blank');
    };
    copyOnClick = () => {
      copyToClipboard(email, t`Email copied to clipboard`);
    };
    openInAppOnClick = () => {
      openEmail(email);
    };
  }

  if (isFieldLinks(fieldDefinition)) {
    const url = (fieldValue as FieldLinksValue).primaryLinkUrl ?? '';
    openLinkOnClick = () => {
      window.open(ensureAbsoluteUrl(url), '_blank');
    };
    copyOnClick = () => {
      copyToClipboard(url, t`Link copied to clipboard`);
    };
  }

  const onClickByAction: Record<
    FieldMetadataSettingsOnClickAction,
    () => void
  > = {
    [FieldMetadataSettingsOnClickAction.OPEN_LINK]: openLinkOnClick,
    [FieldMetadataSettingsOnClickAction.COPY]: copyOnClick,
    [FieldMetadataSettingsOnClickAction.OPEN_IN_APP]: openInAppOnClick,
  };

  const iconByAction = {
    [FieldMetadataSettingsOnClickAction.OPEN_LINK]: IconArrowUpRight,
    [FieldMetadataSettingsOnClickAction.COPY]: IconCopy,
    [FieldMetadataSettingsOnClickAction.OPEN_IN_APP]: IconMail,
  };

  return [
    {
      onClick: onClickByAction[secondaryActionOnClick],
      Icon: iconByAction[secondaryActionOnClick],
    },
  ];
};
