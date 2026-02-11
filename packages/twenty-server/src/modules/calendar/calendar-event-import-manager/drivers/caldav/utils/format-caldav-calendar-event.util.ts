import * as ical from 'node-ical';

import { extractICalPropertyValue } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/extract-ical-property-value.util';
import { extractParticipantsFromEvent } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/extract-participants-from-event.util';
import { isFullDayEvent } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/is-full-day-event.util';
import { sanitizeCalendarEvent } from 'src/modules/calendar/calendar-event-import-manager/drivers/utils/sanitizeCalendarEvent';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event';

const PROPERTIES_TO_SANITIZE: (keyof FetchedCalendarEvent)[] = [
  'title',
  'startsAt',
  'endsAt',
  'id',
  'externalCreatedAt',
  'externalUpdatedAt',
  'description',
  'location',
  'iCalUid',
  'conferenceSolution',
  'conferenceLinkLabel',
  'conferenceLinkUrl',
  'recurringEventExternalId',
  'status',
];

export const formatCalDavCalendarEvent = (
  rawData: string,
  objectUrl: string,
): FetchedCalendarEvent | null => {
  try {
    const parsed = ical.parseICS(rawData);
    const vevents = Object.values(parsed).filter(
      (item) => item.type === 'VEVENT',
    );

    if (vevents.length === 0) {
      return null;
    }

    const event = vevents[0] as ical.VEvent;
    const participants = extractParticipantsFromEvent(event);

    const calendarEvent: FetchedCalendarEvent = {
      id: objectUrl,
      title: extractICalPropertyValue(event.summary, 'Untitled Event'),
      iCalUid: event.uid || '',
      description: extractICalPropertyValue(event.description),
      startsAt: event.start.toISOString(),
      endsAt: event.end.toISOString(),
      location: extractICalPropertyValue(event.location),
      isFullDay: isFullDayEvent(rawData),
      isCanceled: event.status === 'CANCELLED',
      conferenceLinkLabel: '',
      conferenceLinkUrl: extractICalPropertyValue(event.url),
      externalCreatedAt:
        event.created?.toISOString() || new Date().toISOString(),
      externalUpdatedAt:
        event.lastmodified?.toISOString() ||
        event.created?.toISOString() ||
        new Date().toISOString(),
      conferenceSolution: '',
      recurringEventExternalId: event.recurrenceid
        ? String(event.recurrenceid)
        : undefined,
      participants,
      status: event.status || 'CONFIRMED',
    };

    return sanitizeCalendarEvent(calendarEvent, PROPERTIES_TO_SANITIZE);
  } catch {
    return null;
  }
};
