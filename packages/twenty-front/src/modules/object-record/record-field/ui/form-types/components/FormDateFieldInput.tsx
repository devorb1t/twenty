import { t } from '@lingui/core/macro';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { VariableChipStandalone } from '@/object-record/record-field/ui/form-types/components/VariableChipStandalone';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { InputHint } from '@/ui/input/components/InputHint';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { DatePicker } from '@/ui/input/components/internal/date/components/DatePicker';
import {
  MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID,
  MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID,
} from '@/ui/input/components/internal/date/components/DateTimePicker';
import { useParseDateInputStringToPlainDate } from '@/ui/input/components/internal/date/hooks/useParseDateInputStringToPlainDate';
import { useParsePlainDateToDateInputString } from '@/ui/input/components/internal/date/hooks/useParsePlainDateToDateInputString';

import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type Nullable } from 'twenty-ui/utilities';
import {
  getDateFormatStringForDatePickerInputMask,
  isCompleteDatePickerMaskInput,
} from '~/utils/date-utils';

const StyledInputContainerWrapper = styled.div<{ fullWidth?: boolean }>`
  display: grid;
  flex: ${({ fullWidth }) => (fullWidth === true ? '1 1 auto' : 'none')};
  grid-template-columns: 1fr;
  grid-template-rows: 1fr 0;
  min-width: ${({ fullWidth }) => (fullWidth === true ? '0' : 'auto')};
  overflow: visible;
  position: relative;
  width: ${({ fullWidth }) => (fullWidth === true ? '100%' : 'auto')};
`;

const StyledDateInputAbsoluteContainer = styled.div`
  position: absolute;
  top: ${themeCssVariables.spacing[1]};
`;

const StyledDateInput = styled.input<{
  fullWidth?: boolean;
  hasError?: boolean;
}>`
  background-color: transparent;
  border: none;
  color: ${({ hasError }) =>
    hasError
      ? themeCssVariables.color.red
      : themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.font.family};
  font-size: inherit;
  font-weight: inherit;
  min-width: ${({ fullWidth }) => (fullWidth === true ? '0' : 'auto')};
  outline: none;
  padding: ${themeCssVariables.spacing[0]} ${themeCssVariables.spacing[2]};
  width: ${({ fullWidth }) => (fullWidth === true ? '100%' : 'auto')};

  &::placeholder,
  &::-webkit-input-placeholder {
    color: ${themeCssVariables.font.color.light};
    font-family: ${themeCssVariables.font.family};
    font-weight: ${themeCssVariables.font.weight.medium};
  }

  &:disabled {
    color: ${themeCssVariables.font.color.tertiary};
  }
`;

const StyledDateInputContainer = styled.div`
  position: relative;
  z-index: 1;
`;

type DraftValue =
  | {
      type: 'static';
      value: string | null;
      mode: 'view' | 'edit';
    }
  | {
      type: 'variable';
      value: string;
    };

type FormDateFieldInputProps = {
  defaultValue: string | undefined;
  error?: string;
  fullWidth?: boolean;
  label?: string;
  onChange: (value: string | null) => void;
  onError?: (error: string | undefined) => void;
  placeholder?: string;
  readonly?: boolean;
  VariablePicker?: VariablePickerComponent;
};

export const FormDateFieldInput = ({
  defaultValue,
  error: errorFromProps,
  fullWidth = true,
  label,
  onChange,
  onError,
  placeholder,
  readonly,
  VariablePicker,
}: FormDateFieldInputProps) => {
  const instanceId = useId();
  const { dateFormat } = useDateTimeFormat();

  const { parsePlainDateToDateInputString } =
    useParsePlainDateToDateInputString();
  const { parseDateInputStringToPlainDate } =
    useParseDateInputStringToPlainDate();

  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );

  const [draftValue, setDraftValue] = useState<DraftValue>(
    isStandaloneVariableString(defaultValue)
      ? {
          type: 'variable',
          value: defaultValue,
        }
      : {
          type: 'static',
          value: defaultValue ?? null,
          mode: 'view',
        },
  );

  const draftValueAsDate =
    isDefined(draftValue.value) &&
    isNonEmptyString(draftValue.value) &&
    draftValue.type === 'static'
      ? draftValue.value
      : null;

  const [pickerDate, setPickerDate] =
    useState<Nullable<string>>(draftValueAsDate);

  const datePickerWrapperRef = useRef<HTMLDivElement>(null);

  const [inputDate, setInputDate] = useState(
    isDefined(draftValueAsDate) && !isStandaloneVariableString(defaultValue)
      ? parsePlainDateToDateInputString(draftValueAsDate)
      : '',
  );

  const persistDate = (newDate: Nullable<string>) => {
    if (!isDefined(newDate)) {
      onChange(null);
    } else {
      onChange(newDate);
    }
  };

  const { closeDropdown: closeDropdownMonthSelect } = useCloseDropdown();
  const { closeDropdown: closeDropdownYearSelect } = useCloseDropdown();

  const displayDatePicker =
    draftValue.type === 'static' && draftValue.mode === 'edit';

  const defaultPlaceHolder =
    getDateFormatStringForDatePickerInputMask(dateFormat);

  const placeholderToDisplay = placeholder ?? defaultPlaceHolder;

  useListenClickOutside({
    refs: [datePickerWrapperRef],
    listenerId: 'FormDateTimeFieldInputBase',
    callback: (event) => {
      event.stopImmediatePropagation();

      closeDropdownYearSelect(MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID);
      closeDropdownMonthSelect(MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID);
      handlePickerClickOutside();
    },
    enabled: displayDatePicker,
    excludedClickOutsideIds: [
      MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID,
      MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID,
    ],
  });

  const handlePickerChange = (newDate: Nullable<string>) => {
    setErrorMessage(undefined);
    onError?.(undefined);

    setDraftValue({
      type: 'static',
      mode: 'edit',
      value: newDate ?? null,
    });

    setInputDate(
      isDefined(newDate) ? parsePlainDateToDateInputString(newDate) : '',
    );

    setPickerDate(newDate);

    persistDate(newDate);
  };

  const handlePickerEnter = () => {};

  const handlePickerEscape = () => {
    setDraftValue({
      type: 'static',
      value: draftValue.value,
      mode: 'view',
    });
  };

  const handlePickerClickOutside = () => {
    setDraftValue({
      type: 'static',
      value: draftValue.value,
      mode: 'view',
    });
  };

  const handlePickerClear = () => {
    setErrorMessage(undefined);
    onError?.(undefined);

    setDraftValue({
      type: 'static',
      value: null,
      mode: 'view',
    });

    setPickerDate(null);

    setInputDate('');

    persistDate(null);
  };

  const persistTypedDate = (rawTrimmed: string) => {
    if (readonly === true) {
      return;
    }

    if (rawTrimmed === '') {
      handlePickerClear();
      return;
    }

    if (!isCompleteDatePickerMaskInput(rawTrimmed, dateFormat)) {
      setErrorMessage(undefined);
      onError?.(undefined);
      return;
    }

    const parsedInputPlainDate = parseDateInputStringToPlainDate(rawTrimmed);

    if (!isDefined(parsedInputPlainDate)) {
      setErrorMessage(t`Invalid date`);
      onError?.(t`Invalid date`);
      return;
    }

    setErrorMessage(undefined);
    onError?.(undefined);

    const validatedDate = parsedInputPlainDate;

    setDraftValue({
      type: 'static',
      value: validatedDate,
      mode: 'edit',
    });

    setPickerDate(validatedDate);

    setInputDate(parsePlainDateToDateInputString(validatedDate));

    persistDate(validatedDate);
  };

  const handlePickerMouseSelect = (newDate: Nullable<string>) => {
    setErrorMessage(undefined);
    onError?.(undefined);

    setDraftValue({
      type: 'static',
      value: newDate ?? null,
      mode: 'view',
    });

    setPickerDate(newDate);

    setInputDate(
      isDefined(newDate) ? parsePlainDateToDateInputString(newDate) : '',
    );

    persistDate(newDate);
  };

  const handleInputFocus = () => {
    setDraftValue({
      type: 'static',
      mode: 'edit',
      value: draftValue.value,
    });
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setInputDate(nextValue);
    persistTypedDate(nextValue.trim());
  };

  const handleInputKeydown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== Key.Enter) {
      return;
    }

    persistTypedDate(event.currentTarget.value.trim());
  };

  const handleVariableTagInsert = (variableName: string) => {
    setErrorMessage(undefined);
    onError?.(undefined);

    setDraftValue({
      type: 'variable',
      value: variableName,
    });

    setInputDate('');

    onChange(variableName);
  };

  const handleUnlinkVariable = () => {
    setErrorMessage(undefined);
    onError?.(undefined);

    setDraftValue({
      type: 'static',
      value: null,
      mode: 'view',
    });

    setPickerDate(null);

    onChange(null);
  };

  const error = errorMessage ?? errorFromProps;

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: handlePickerEscape,
    focusId: instanceId,
    dependencies: [handlePickerEscape],
  });

  return (
    <FormFieldInputContainer>
      {label ? <InputLabel>{label}</InputLabel> : null}

      <FormFieldInputRowContainer>
        <StyledInputContainerWrapper
          ref={datePickerWrapperRef}
          fullWidth={fullWidth}
        >
          <FormFieldInputInnerContainer
            formFieldInputInstanceId={instanceId}
            hasRightElement={isDefined(VariablePicker) && !readonly}
          >
            {draftValue.type === 'static' ? (
              <>
                <StyledDateInput
                  fullWidth={fullWidth}
                  type="text"
                  placeholder={placeholderToDisplay}
                  value={inputDate}
                  hasError={isDefined(error)}
                  onFocus={handleInputFocus}
                  onChange={handleInputChange}
                  onKeyDown={handleInputKeydown}
                  disabled={readonly}
                />

                {draftValue.mode === 'edit' ? (
                  <StyledDateInputContainer>
                    <StyledDateInputAbsoluteContainer>
                      <OverlayContainer>
                        <DatePicker
                          instanceId={instanceId}
                          plainDateString={pickerDate}
                          onChange={handlePickerChange}
                          onClose={handlePickerMouseSelect}
                          onEnter={handlePickerEnter}
                          onEscape={handlePickerEscape}
                          onClear={handlePickerClear}
                          hideHeaderInput
                        />
                      </OverlayContainer>
                    </StyledDateInputAbsoluteContainer>
                  </StyledDateInputContainer>
                ) : null}
              </>
            ) : (
              <VariableChipStandalone
                rawVariableName={draftValue.value}
                onRemove={readonly ? undefined : handleUnlinkVariable}
              />
            )}
          </FormFieldInputInnerContainer>
        </StyledInputContainerWrapper>

        {VariablePicker && !readonly ? (
          <VariablePicker
            instanceId={instanceId}
            onVariableSelect={handleVariableTagInsert}
          />
        ) : null}
      </FormFieldInputRowContainer>

      {error ? <InputHint danger>{error}</InputHint> : null}
    </FormFieldInputContainer>
  );
};
