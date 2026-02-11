import { Injectable, Logger } from '@nestjs/common';

import { CALDAV_FUTURE_DAYS_WINDOW } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/constants/caldav-future-days-window.constant';
import { CALDAV_PAST_DAYS_WINDOW } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/constants/caldav-past-days-window.constant';
import { CalDavHttpException } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/exceptions/caldav-http.exception';
import { CalDavClientProvider } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/providers/caldav-client.provider';
import { type CalDAVClient } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/services/caldav-client';
import { type CalDavCalendar } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/types/caldav-calendar.type';
import { type CalDavSyncCursor } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/types/caldav-sync-cursor.type';
import { extractICalData } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/extract-ical-data.util';
import { formatCalDavCalendarEvent } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/format-caldav-calendar-event.util';
import { isEventInTimeRange } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/is-event-in-time-range.util';
import { parseCalDAVError } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/parse-caldav-error.util';
import { type GetCalendarEventsResponse } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-get-events.service';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class CalDavGetEventsService {
  private readonly logger = new Logger(CalDavGetEventsService.name);

  constructor(private readonly caldavClientProvider: CalDavClientProvider) {}

  public async getCalendarEvents(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'id' | 'connectionParameters' | 'handle'
    >,
    syncCursor?: string,
  ): Promise<GetCalendarEventsResponse> {
    this.logger.debug(`Getting calendar events for ${connectedAccount.handle}`);

    try {
      const client =
        this.caldavClientProvider.getCalDavCalendarClient(connectedAccount);

      const parsedSyncCursor: CalDavSyncCursor | undefined = syncCursor
        ? JSON.parse(syncCursor)
        : undefined;

      const startDate = new Date(
        Date.now() - CALDAV_PAST_DAYS_WINDOW * 24 * 60 * 60 * 1000,
      );
      const endDate = new Date(
        Date.now() + CALDAV_FUTURE_DAYS_WINDOW * 24 * 60 * 60 * 1000,
      );

      const calendars = await client.listCalendars();

      const syncResults = await Promise.all(
        calendars.map((calendar) =>
          this.syncCalendar(
            client,
            calendar,
            startDate,
            endDate,
            parsedSyncCursor,
          ),
        ),
      );

      const allEvents = syncResults.flatMap((result) => result.events);

      const updatedSyncTokens = await client.fetchAllCalendarSyncTokens();

      const syncTokens: Record<string, string> = {};

      for (const result of syncResults) {
        const updatedToken = updatedSyncTokens[result.calendarUrl];

        if (updatedToken) {
          syncTokens[result.calendarUrl] = updatedToken;
        } else if (result.fallbackSyncToken) {
          syncTokens[result.calendarUrl] = result.fallbackSyncToken;
        }
      }

      this.logger.debug(
        `Found ${allEvents.length} calendar events for ${connectedAccount.handle}`,
      );

      return {
        fullEvents: true,
        calendarEvents: allEvents,
        nextSyncCursor: JSON.stringify({ syncTokens }),
      };
    } catch (error) {
      this.logger.error(
        `Failed to get calendar events for ${connectedAccount.handle}`,
        error,
      );

      throw parseCalDAVError(error as Error);
    }
  }

  private async syncCalendar(
    client: CalDAVClient,
    calendar: CalDavCalendar,
    startDate: Date,
    endDate: Date,
    parsedSyncCursor?: CalDavSyncCursor,
  ): Promise<{
    calendarUrl: string;
    events: FetchedCalendarEvent[];
    fallbackSyncToken?: string;
  }> {
    const existingSyncToken =
      parsedSyncCursor?.syncTokens[calendar.url] ||
      calendar.syncToken?.toString();

    try {
      const changedObjects = await client.syncCalendarCollection(
        calendar.url,
        existingSyncToken,
      );

      const objectUrls = changedObjects.map((obj) => obj.href);

      const events =
        objectUrls.length > 0
          ? await this.fetchEventsFromChangedObjects(
              client,
              calendar.url,
              objectUrls,
              startDate,
              endDate,
            )
          : [];

      return {
        calendarUrl: calendar.url,
        events,
        fallbackSyncToken: existingSyncToken,
      };
    } catch (error) {
      if (error instanceof CalDavHttpException) {
        throw error;
      }

      this.logger.error(`Failed to sync calendar ${calendar.url}`, error);

      return {
        calendarUrl: calendar.url,
        events: [],
        fallbackSyncToken: parsedSyncCursor?.syncTokens[calendar.url],
      };
    }
  }

  private async fetchEventsFromChangedObjects(
    client: CalDAVClient,
    calendarUrl: string,
    objectUrls: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<FetchedCalendarEvent[]> {
    try {
      const calendarObjects = await client.fetchCalendarObjects(
        calendarUrl,
        objectUrls,
      );

      return calendarObjects
        .map((calendarObject) => {
          const iCalData = extractICalData(calendarObject.calendarData);

          if (!iCalData) {
            return null;
          }

          const event = formatCalDavCalendarEvent(
            iCalData,
            calendarObject.href,
          );

          if (!event) {
            this.logger.debug(
              `Could not parse calendar object ${calendarObject.href}`,
            );

            return null;
          }

          if (!isEventInTimeRange(event, startDate, endDate)) {
            return null;
          }

          return event;
        })
        .filter((event): event is FetchedCalendarEvent => event !== null);
    } catch (error) {
      if (error instanceof CalDavHttpException) {
        throw error;
      }

      this.logger.error(
        `Failed to fetch calendar objects for ${calendarUrl}`,
        error,
      );

      return [];
    }
  }
}
