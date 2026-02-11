import { type VEvent } from 'node-ical';

import { parseAttendee } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/parse-attendee.util';
import { type FetchedCalendarEventParticipant } from 'src/modules/calendar/common/types/fetched-calendar-event';

export const extractAttendeesFromEvent = (
  event: VEvent,
): FetchedCalendarEventParticipant[] => {
  if (!event.attendee) {
    return [];
  }

  const attendees = Array.isArray(event.attendee)
    ? event.attendee
    : [event.attendee];

  return attendees.map(parseAttendee);
};
