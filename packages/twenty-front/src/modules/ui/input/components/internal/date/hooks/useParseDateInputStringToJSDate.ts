import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { isValid, parse } from 'date-fns';
import {
  getDateFormatStringForDatePickerInputMask,
  isCompleteDatePickerMaskInput,
} from '~/utils/date-utils';

export const useParseDateInputStringToJSDate = () => {
  const { dateFormat } = useDateTimeFormat();

  const parseDateInputStringToJSDate = (dateAsString: string) => {
    const trimmedInput = dateAsString.trim();

    if (!isCompleteDatePickerMaskInput(trimmedInput, dateFormat)) {
      return null;
    }

    const parsingFormat = getDateFormatStringForDatePickerInputMask(dateFormat);

    const parsedDate = parse(trimmedInput, parsingFormat, new Date());

    if (!isValid(parsedDate)) {
      return null;
    }

    return parsedDate;
  };

  return {
    parseDateInputStringToJSDate,
  };
};
