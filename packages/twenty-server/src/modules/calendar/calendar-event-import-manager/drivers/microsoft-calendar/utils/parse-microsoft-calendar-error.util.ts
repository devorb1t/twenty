import { type GraphError } from '@microsoft/microsoft-graph-client';

import {
  CalendarEventImportDriverException,
  CalendarEventImportDriverExceptionCode,
} from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';
import { isDefined } from 'twenty-shared/utils';

const isNetworkError = (error: GraphError): boolean => {
  if (error instanceof TypeError) {
    return true;
  }

  const cause = (error as unknown as { cause?: { code?: string } })?.cause;

  if (!isDefined(cause)) {
    return false;
  }

  const networkErrorCodes = [
    'ECONNRESET',
    'ENOTFOUND',
    'ECONNABORTED',
    'ETIMEDOUT',
    'ECONNREFUSED',
    'EHOSTUNREACH',
    'ERR_NETWORK',
    'UND_ERR_CONNECT_TIMEOUT',
    'UND_ERR_SOCKET',
  ];

  return isDefined(cause.code) && networkErrorCodes.includes(cause.code);
};

export const parseMicrosoftCalendarError = (
  error: GraphError,
): CalendarEventImportDriverException => {
  if (isNetworkError(error)) {
    return new CalendarEventImportDriverException(
      `Microsoft Calendar network error: ${error.message}`,
      CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  }

  const { statusCode, message } = error;

  if (!isDefined(statusCode)) {
    return new CalendarEventImportDriverException(
      `Microsoft Calendar error without status code: ${message}`,
      CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  }

  switch (statusCode) {
    case 400:
      return new CalendarEventImportDriverException(
        message,
        CalendarEventImportDriverExceptionCode.UNKNOWN,
      );

    case 404:
      if (
        message ==
        'The mailbox is either inactive, soft-deleted, or is hosted on-premise.'
      ) {
        return new CalendarEventImportDriverException(
          message,
          CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
        );
      }

      return new CalendarEventImportDriverException(
        message,
        CalendarEventImportDriverExceptionCode.NOT_FOUND,
      );

    case 410:
      return new CalendarEventImportDriverException(
        message,
        CalendarEventImportDriverExceptionCode.SYNC_CURSOR_ERROR,
      );

    case 429:
    case 500:
    case 502:
    case 503:
    case 504:
      return new CalendarEventImportDriverException(
        message,
        CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
      );

    case 403:
      return new CalendarEventImportDriverException(
        message,
        CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      );

    case 401:
      return new CalendarEventImportDriverException(
        message,
        CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      );

    default:
      return new CalendarEventImportDriverException(
        message,
        CalendarEventImportDriverExceptionCode.UNKNOWN,
      );
  }
};
