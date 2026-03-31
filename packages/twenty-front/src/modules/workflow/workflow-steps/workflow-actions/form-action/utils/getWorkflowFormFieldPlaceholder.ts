import { isNonEmptyString } from '@sniptt/guards';
import { FieldMetadataType } from 'twenty-shared/types';
import { type DateFormat } from '@/localization/constants/DateFormat';
import { type WorkflowFormActionField } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormActionField';
import { getDefaultFormFieldSettings } from '@/workflow/workflow-steps/workflow-actions/form-action/utils/getDefaultFormFieldSettings';
import { getDateFormatStringForDatePickerInputMask } from '~/utils/date-utils';

export const getWorkflowFormFieldPlaceholder = ({
  field,
  dateFormat,
}: {
  field: WorkflowFormActionField;
  dateFormat: DateFormat;
}): string | undefined => {
  if (field.type === FieldMetadataType.DATE) {
    if (isNonEmptyString(field.placeholder)) {
      return field.placeholder;
    }

    return getDateFormatStringForDatePickerInputMask(dateFormat);
  }

  if (isNonEmptyString(field.placeholder)) {
    return field.placeholder;
  }

  return getDefaultFormFieldSettings(field.type).placeholder;
};
