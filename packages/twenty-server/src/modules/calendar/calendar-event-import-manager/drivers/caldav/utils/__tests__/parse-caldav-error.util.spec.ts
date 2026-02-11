import { CalDavHttpException } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/exceptions/caldav-http.exception';
import { parseCalDAVError } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/parse-caldav-error.util';
import { CalendarEventImportDriverExceptionCode } from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';

describe('parseCalDAVError', () => {
  it('should map "Invalid credentials" to INSUFFICIENT_PERMISSIONS', () => {
    const error = new Error('Invalid credentials');

    expect(parseCalDAVError(error).code).toBe(
      CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('should map "Collection does not exist on server" to NOT_FOUND', () => {
    const error = new Error('Collection does not exist on server');

    expect(parseCalDAVError(error).code).toBe(
      CalendarEventImportDriverExceptionCode.NOT_FOUND,
    );
  });

  it('should map "no account for fetchCalendars" to INSUFFICIENT_PERMISSIONS', () => {
    const error = new Error('no account for fetchCalendars');

    expect(parseCalDAVError(error).code).toBe(
      CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('should map network errors to TEMPORARY_ERROR', () => {
    const error = Object.assign(new Error('Connection reset'), {
      code: 'ECONNRESET',
    });

    expect(parseCalDAVError(error).code).toBe(
      CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  });

  it('should map ETIMEDOUT to TEMPORARY_ERROR', () => {
    const error = Object.assign(new Error('Timed out'), {
      code: 'ETIMEDOUT',
    });

    expect(parseCalDAVError(error).code).toBe(
      CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  });

  it('should map HTTP 401 to INSUFFICIENT_PERMISSIONS', () => {
    const error = new CalDavHttpException(401, 'Unauthorized');

    expect(parseCalDAVError(error).code).toBe(
      CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('should map HTTP 403 to INSUFFICIENT_PERMISSIONS', () => {
    const error = new CalDavHttpException(403, 'Forbidden');

    expect(parseCalDAVError(error).code).toBe(
      CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('should map HTTP 404 to NOT_FOUND', () => {
    const error = new CalDavHttpException(404, 'Not Found');

    expect(parseCalDAVError(error).code).toBe(
      CalendarEventImportDriverExceptionCode.NOT_FOUND,
    );
  });

  it('should map HTTP 429 to TEMPORARY_ERROR', () => {
    const error = new CalDavHttpException(429, 'Too Many Requests');

    expect(parseCalDAVError(error).code).toBe(
      CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  });

  it('should map HTTP 500 to TEMPORARY_ERROR', () => {
    const error = new CalDavHttpException(500, 'Internal Server Error');

    expect(parseCalDAVError(error).code).toBe(
      CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  });

  it('should map unhandled HTTP status to UNKNOWN', () => {
    const error = new CalDavHttpException(418, "I'm a Teapot");

    expect(parseCalDAVError(error).code).toBe(
      CalendarEventImportDriverExceptionCode.UNKNOWN,
    );
  });

  it('should map CALDAV_SYNC_COLLECTION_NOT_SUPPORTED to CHANNEL_MISCONFIGURED', () => {
    const error = new Error(
      'CALDAV_SYNC_COLLECTION_NOT_SUPPORTED: Your CalDAV server does not support incremental sync (RFC 6578)',
    );

    expect(parseCalDAVError(error).code).toBe(
      CalendarEventImportDriverExceptionCode.CHANNEL_MISCONFIGURED,
    );
  });

  it('should map unknown errors to UNKNOWN', () => {
    const error = new Error('Something unexpected happened');

    expect(parseCalDAVError(error).code).toBe(
      CalendarEventImportDriverExceptionCode.UNKNOWN,
    );
  });
});
