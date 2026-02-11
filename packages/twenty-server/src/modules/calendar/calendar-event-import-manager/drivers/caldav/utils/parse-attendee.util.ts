import { type Attendee } from 'node-ical';

import { mapPartStatToResponseStatus } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/map-partstat-to-response-status.util';
import { type FetchedCalendarEventParticipant } from 'src/modules/calendar/common/types/fetched-calendar-event';

export const parseAttendee = (
  attendee: Attendee,
): FetchedCalendarEventParticipant => {
  if (typeof attendee === 'string') {
    const handle = attendee.replace(/^mailto:/i, '');

    return {
      displayName: handle || 'Unknown',
      responseStatus: mapPartStatToResponseStatus('NEEDS-ACTION'),
      handle,
      isOrganizer: false,
    };
  }

  const handle = attendee.val?.replace(/^mailto:/i, '') || '';
  const displayName = attendee.params?.CN || handle || 'Unknown';
  const partStat = attendee.params?.PARTSTAT || 'NEEDS-ACTION';

  return {
    displayName,
    responseStatus: mapPartStatToResponseStatus(partStat),
    handle,
    isOrganizer: false,
  };
};
