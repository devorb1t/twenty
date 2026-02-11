import { Logger } from '@nestjs/common';

import {
  calendarMultiGet,
  createAccount,
  type DAVAccount,
  type DAVCalendar,
  DAVNamespaceShort,
  type DAVResponse,
  fetchCalendars,
  getBasicAuthHeaders,
  syncCollection,
} from 'tsdav';

import { CalDavHttpException } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/exceptions/caldav-http.exception';
import { type CalDavCalendar } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/types/caldav-calendar.type';
import { type CalDavCredentials } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/types/caldav-credentials.type';

const DEFAULT_CALENDAR_TYPE = 'caldav';
const ALLOWED_EXTENSIONS = ['eml', 'ics'];

export class CalDAVClient {
  private readonly credentials: CalDavCredentials;
  private readonly logger = new Logger(CalDAVClient.name);
  private readonly headers: Record<string, string>;

  constructor(credentials: CalDavCredentials) {
    this.credentials = credentials;
    this.headers = getBasicAuthHeaders({
      username: credentials.username,
      password: credentials.password,
    });
  }

  private async getAccount(): Promise<DAVAccount> {
    return createAccount({
      account: {
        serverUrl: this.credentials.serverUrl,
        accountType: DEFAULT_CALENDAR_TYPE,
        credentials: {
          username: this.credentials.username,
          password: this.credentials.password,
        },
      },
      headers: this.headers,
    });
  }

  private hasFileExtension(url: string): boolean {
    const fileName = url.substring(url.lastIndexOf('/') + 1);

    return (
      fileName.includes('.') &&
      !fileName.substring(fileName.lastIndexOf('.')).includes('/')
    );
  }

  private getFileExtension(url: string): string {
    if (!this.hasFileExtension(url)) return 'ics';
    const fileName = url.substring(url.lastIndexOf('/') + 1);

    return fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
  }

  isValidCalendarObjectUrl(url: string): boolean {
    return ALLOWED_EXTENSIONS.includes(this.getFileExtension(url));
  }

  private throwOnHttpError(responses: DAVResponse[]): void {
    const failedResponse = responses.find((response) => !response.ok);

    if (failedResponse) {
      throw new CalDavHttpException(
        failedResponse.status,
        failedResponse.statusText,
      );
    }
  }

  async listCalendars(): Promise<CalDavCalendar[]> {
    const account = await this.getAccount();

    const calendars = (await fetchCalendars({
      account,
      headers: this.headers,
    })) as (Omit<DAVCalendar, 'displayName'> & {
      displayName?: string | Record<string, unknown>;
    })[];

    return calendars.reduce<CalDavCalendar[]>((result, calendar) => {
      if (!calendar.components?.includes('VEVENT')) return result;

      result.push({
        id: calendar.url,
        url: calendar.url,
        name:
          typeof calendar.displayName === 'string'
            ? calendar.displayName
            : 'Unnamed Calendar',
        isPrimary: false,
      });

      return result;
    }, []);
  }

  async validateSyncCollectionSupport(): Promise<void> {
    const account = await this.getAccount();

    const calendars = await fetchCalendars({
      account,
      headers: this.headers,
    });

    const eventCalendar = calendars.find((calendar) =>
      calendar.components?.includes('VEVENT'),
    );

    if (!eventCalendar) {
      throw new Error('No calendar with event support found');
    }

    const supportsSyncCollection =
      eventCalendar.reports?.includes('syncCollection') ?? false;

    if (!supportsSyncCollection) {
      throw new Error(
        'CALDAV_SYNC_COLLECTION_NOT_SUPPORTED: Your CalDAV server does not support incremental sync (RFC 6578)',
      );
    }
  }

  async syncCalendarCollection(
    calendarUrl: string,
    syncToken?: string,
  ): Promise<{ href: string }[]> {
    const syncResult = await syncCollection({
      url: calendarUrl,
      props: {
        [`${DAVNamespaceShort.DAV}:getetag`]: {},
        [`${DAVNamespaceShort.CALDAV}:calendar-data`]: {},
      },
      syncLevel: 1,
      ...(syncToken ? { syncToken } : {}),
      headers: this.headers,
    });

    this.throwOnHttpError(syncResult);

    return syncResult
      .map((item) => ({ href: item.href || '' }))
      .filter((item) => item.href && this.isValidCalendarObjectUrl(item.href));
  }

  async fetchCalendarObjects(
    calendarUrl: string,
    objectUrls: string[],
  ): Promise<
    {
      href: string;
      calendarData: string | Record<string, unknown>;
      etag: string;
    }[]
  > {
    const calendarObjects = await calendarMultiGet({
      url: calendarUrl,
      props: {
        [`${DAVNamespaceShort.DAV}:getetag`]: {},
        [`${DAVNamespaceShort.CALDAV}:calendar-data`]: {},
      },
      objectUrls,
      depth: '1',
      headers: this.headers,
    });

    this.throwOnHttpError(calendarObjects);

    return calendarObjects
      .filter((obj) => obj.props?.calendarData)
      .map((obj) => ({
        href: obj.href || '',
        calendarData: obj.props!.calendarData,
        etag: obj.props!.getetag || '',
      }));
  }

  async fetchAllCalendarSyncTokens(): Promise<Record<string, string>> {
    try {
      const account = await this.getAccount();
      const calendars = await fetchCalendars({
        account,
        headers: this.headers,
      });

      const syncTokens: Record<string, string> = {};

      for (const calendar of calendars) {
        if (calendar.syncToken) {
          syncTokens[calendar.url] = calendar.syncToken.toString();
        }
      }

      return syncTokens;
    } catch (error) {
      this.logger.error('Failed to fetch calendar sync tokens', error);

      return {};
    }
  }
}
