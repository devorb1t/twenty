import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { format, isValid, parse } from 'date-fns';
import { DATE_TYPE_FORMAT } from 'twenty-shared/constants';
import {
  getDateFormatStringForDatePickerInputMask,
  isCompleteDatePickerMaskInput,
} from '~/utils/date-utils';

export const useParseDateInputStringToPlainDate = () => {
  const { dateFormat } = useDateTimeFormat();

  const parseDateInputStringToPlainDate = (dateAsString: string) => {
    const trimmedInput = dateAsString.trim();

    if (!isCompleteDatePickerMaskInput(trimmedInput, dateFormat)) {
      return null;
    }

    const parsingFormat = getDateFormatStringForDatePickerInputMask(dateFormat);

    const parsedDate = parse(trimmedInput, parsingFormat, new Date());

    if (!isValid(parsedDate)) {
      return null;
    }

    const formattedDate = format(parsedDate, DATE_TYPE_FORMAT);

    return formattedDate;
  };

  return {
    parseDateInputStringToPlainDate,
  };
};
