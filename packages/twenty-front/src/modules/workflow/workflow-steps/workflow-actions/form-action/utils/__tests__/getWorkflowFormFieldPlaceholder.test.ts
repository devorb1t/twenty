import { FieldMetadataType } from 'twenty-shared/types';
import { DateFormat } from '@/localization/constants/DateFormat';
import { getWorkflowFormFieldPlaceholder } from '@/workflow/workflow-steps/workflow-actions/form-action/utils/getWorkflowFormFieldPlaceholder';

describe('getWorkflowFormFieldPlaceholder', () => {
  it('should use locale date mask for DATE when placeholder is empty', () => {
    expect(
      getWorkflowFormFieldPlaceholder({
        field: {
          id: '1',
          name: 'date',
          label: 'Date',
          type: FieldMetadataType.DATE,
          placeholder: '',
        },
        dateFormat: DateFormat.MONTH_FIRST,
      }),
    ).toBe('MM/dd/yyyy');

    expect(
      getWorkflowFormFieldPlaceholder({
        field: {
          id: '1',
          name: 'date',
          label: 'Date',
          type: FieldMetadataType.DATE,
        },
        dateFormat: DateFormat.DAY_FIRST,
      }),
    ).toBe('dd/MM/yyyy');

    expect(
      getWorkflowFormFieldPlaceholder({
        field: {
          id: '1',
          name: 'date',
          label: 'Date',
          type: FieldMetadataType.DATE,
        },
        dateFormat: DateFormat.YEAR_FIRST,
      }),
    ).toBe('yyyy-MM-dd');
  });

  it('should keep custom placeholder for DATE when non-empty', () => {
    expect(
      getWorkflowFormFieldPlaceholder({
        field: {
          id: '1',
          name: 'date',
          label: 'Date',
          type: FieldMetadataType.DATE,
          placeholder: 'Custom hint',
        },
        dateFormat: DateFormat.MONTH_FIRST,
      }),
    ).toBe('Custom hint');
  });

  it('should use default text placeholder when TEXT field has empty placeholder', () => {
    expect(
      getWorkflowFormFieldPlaceholder({
        field: {
          id: '1',
          name: 'text',
          label: 'Text',
          type: FieldMetadataType.TEXT,
          placeholder: '',
        },
        dateFormat: DateFormat.MONTH_FIRST,
      }),
    ).toBe('Enter your text');
  });
});
