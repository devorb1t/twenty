import { type VEvent } from 'node-ical';

import { extractAttendeesFromEvent } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/extract-attendees-from-event.util';
import { extractOrganizerFromEvent } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/extract-organizer-from-event.util';
import { type FetchedCalendarEventParticipant } from 'src/modules/calendar/common/types/fetched-calendar-event';

export const extractParticipantsFromEvent = (
  event: VEvent,
): FetchedCalendarEventParticipant[] => {
  const participants: FetchedCalendarEventParticipant[] = [];

  const organizer = extractOrganizerFromEvent(event);

  if (organizer) {
    participants.push(organizer);
  }

  const attendees = extractAttendeesFromEvent(event);

  participants.push(...attendees);

  return participants;
};
