import * as ical from 'node-ical';

import { extractParticipantsFromEvent } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/extract-participants-from-event.util';
import { CalendarEventParticipantResponseStatus } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';

const parseFirstEvent = (icsData: string): ical.VEvent => {
  const parsed = ical.parseICS(icsData);
  const events = Object.values(parsed).filter((item) => item.type === 'VEVENT');

  return events[0] as ical.VEvent;
};

describe('extractParticipantsFromEvent', () => {
  it('should extract organizer and attendees', () => {
    const event = parseFirstEvent(
      [
        'BEGIN:VCALENDAR',
        'BEGIN:VEVENT',
        'UID:test@example.com',
        'DTSTART:20230615T090000Z',
        'DTEND:20230615T100000Z',
        'ORGANIZER;CN=Alice:mailto:alice@example.com',
        'ATTENDEE;CN=Bob;PARTSTAT=ACCEPTED:mailto:bob@example.com',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n'),
    );

    const participants = extractParticipantsFromEvent(event);

    expect(participants).toHaveLength(2);

    const organizer = participants.find((p) => p.isOrganizer);

    expect(organizer).toBeDefined();
    expect(organizer!.handle).toBe('alice@example.com');
    expect(organizer!.responseStatus).toBe(
      CalendarEventParticipantResponseStatus.ACCEPTED,
    );

    const attendee = participants.find((p) => !p.isOrganizer);

    expect(attendee).toBeDefined();
    expect(attendee!.handle).toBe('bob@example.com');
  });

  it('should return empty array when no organizer and no attendees', () => {
    const event = parseFirstEvent(
      [
        'BEGIN:VCALENDAR',
        'BEGIN:VEVENT',
        'UID:solo@example.com',
        'DTSTART:20230615T090000Z',
        'DTEND:20230615T100000Z',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n'),
    );

    const participants = extractParticipantsFromEvent(event);

    expect(participants).toHaveLength(0);
  });

  it('should strip mailto: prefix from attendee handles', () => {
    const event = parseFirstEvent(
      [
        'BEGIN:VCALENDAR',
        'BEGIN:VEVENT',
        'UID:mailto-test@example.com',
        'DTSTART:20230615T090000Z',
        'DTEND:20230615T100000Z',
        'ATTENDEE;PARTSTAT=ACCEPTED:mailto:charlie@example.com',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n'),
    );

    const participants = extractParticipantsFromEvent(event);

    expect(participants[0].handle).toBe('charlie@example.com');
  });

  it('should map each PARTSTAT value to the correct response status', () => {
    const event = parseFirstEvent(
      [
        'BEGIN:VCALENDAR',
        'BEGIN:VEVENT',
        'UID:partstat@example.com',
        'DTSTART:20230615T090000Z',
        'DTEND:20230615T100000Z',
        'ATTENDEE;PARTSTAT=ACCEPTED:mailto:a@test.com',
        'ATTENDEE;PARTSTAT=DECLINED:mailto:d@test.com',
        'ATTENDEE;PARTSTAT=TENTATIVE:mailto:t@test.com',
        'ATTENDEE;PARTSTAT=NEEDS-ACTION:mailto:n@test.com',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n'),
    );

    const participants = extractParticipantsFromEvent(event);
    const byHandle = new Map(participants.map((p) => [p.handle, p]));

    expect(byHandle.get('a@test.com')!.responseStatus).toBe(
      CalendarEventParticipantResponseStatus.ACCEPTED,
    );
    expect(byHandle.get('d@test.com')!.responseStatus).toBe(
      CalendarEventParticipantResponseStatus.DECLINED,
    );
    expect(byHandle.get('t@test.com')!.responseStatus).toBe(
      CalendarEventParticipantResponseStatus.TENTATIVE,
    );
    expect(byHandle.get('n@test.com')!.responseStatus).toBe(
      CalendarEventParticipantResponseStatus.NEEDS_ACTION,
    );
  });
});
