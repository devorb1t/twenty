import { type VEvent } from 'node-ical';

import { CalendarEventParticipantResponseStatus } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { type FetchedCalendarEventParticipant } from 'src/modules/calendar/common/types/fetched-calendar-event';

export const extractOrganizerFromEvent = (
  event: VEvent,
): FetchedCalendarEventParticipant | null => {
  if (!event.organizer) {
    return null;
  }

  if (typeof event.organizer === 'string') {
    const email = event.organizer.replace(/^mailto:/i, '');

    return {
      displayName: email || 'Unknown',
      responseStatus: CalendarEventParticipantResponseStatus.ACCEPTED,
      handle: email,
      isOrganizer: true,
    };
  }

  const organizerEmail = event.organizer.val?.replace(/^mailto:/i, '') || '';

  return {
    displayName: event.organizer.params?.CN || organizerEmail || 'Unknown',
    responseStatus: CalendarEventParticipantResponseStatus.ACCEPTED,
    handle: organizerEmail,
    isOrganizer: true,
  };
};
