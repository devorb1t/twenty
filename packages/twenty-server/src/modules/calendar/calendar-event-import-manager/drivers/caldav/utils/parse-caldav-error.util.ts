import { CalDavHttpException } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/exceptions/caldav-http.exception';
import {
  CalendarEventImportDriverException,
  CalendarEventImportDriverExceptionCode,
} from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';
import { parseCalDAVHttpStatusError } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/parse-caldav-http-status-error.util';

const NETWORK_ERROR_CODES = [
  'ECONNRESET',
  'ENOTFOUND',
  'ECONNABORTED',
  'ETIMEDOUT',
  'ERR_NETWORK',
];

export const parseCalDAVError = (
  error: Error & { code?: string },
): CalendarEventImportDriverException => {
  const { message } = error;

  if (error.code && NETWORK_ERROR_CODES.includes(error.code)) {
    return new CalendarEventImportDriverException(
      message,
      CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  }

  if (error instanceof CalDavHttpException) {
    return parseCalDAVHttpStatusError(error.status, message);
  }

  if (message.includes('CALDAV_SYNC_COLLECTION_NOT_SUPPORTED')) {
    return new CalendarEventImportDriverException(
      message,
      CalendarEventImportDriverExceptionCode.CHANNEL_MISCONFIGURED,
    );
  }

  switch (message) {
    case 'Collection does not exist on server':
      return new CalendarEventImportDriverException(
        message,
        CalendarEventImportDriverExceptionCode.NOT_FOUND,
      );

    case 'no account for smartCollectionSync':
    case 'no account for fetchAddressBooks':
    case 'no account for fetchCalendars':
    case 'Must have account before syncCalendars':
    case 'Invalid credentials':
    case 'Invalid auth method':
      return new CalendarEventImportDriverException(
        message,
        CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      );

    case 'cannot fetchVCards for undefined addressBook':
    case 'cannot find calendarUserAddresses':
    case 'cannot fetchCalendarObjects for undefined calendar':
    case 'cannot find homeUrl':
      return new CalendarEventImportDriverException(
        message,
        CalendarEventImportDriverExceptionCode.NOT_FOUND,
      );

    default:
      return new CalendarEventImportDriverException(
        message,
        CalendarEventImportDriverExceptionCode.UNKNOWN,
      );
  }
};
