import { formatCalDavCalendarEvent } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/format-caldav-calendar-event.util';
import { CalendarEventParticipantResponseStatus } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';

const buildICalEvent = (overrides: Record<string, string> = {}): string => {
  const defaults: Record<string, string> = {
    UID: 'test-uid-123@example.com',
    SUMMARY: 'Team Standup',
    DESCRIPTION: 'Daily sync meeting',
    LOCATION: 'Conference Room B',
    DTSTART: '20230615T090000Z',
    DTEND: '20230615T093000Z',
    STATUS: 'CONFIRMED',
    CREATED: '20230601T120000Z',
    'LAST-MODIFIED': '20230610T120000Z',
    ORGANIZER: 'ORGANIZER;CN=Alice:mailto:alice@example.com',
    ATTENDEE: 'ATTENDEE;CN=Bob;PARTSTAT=ACCEPTED:mailto:bob@example.com',
  };

  const merged = { ...defaults, ...overrides };

  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT'];

  for (const [key, value] of Object.entries(merged)) {
    if (key === 'ORGANIZER' || key === 'ATTENDEE') {
      lines.push(value);
    } else {
      lines.push(`${key}:${value}`);
    }
  }

  lines.push('END:VEVENT', 'END:VCALENDAR');

  return lines.join('\r\n');
};

describe('formatCalDavCalendarEvent', () => {
  it('should format a standard event with all fields populated', () => {
    const rawData = buildICalEvent();
    const result = formatCalDavCalendarEvent(rawData, '/cal/event1.ics');

    expect(result).not.toBeNull();
    expect(result!.id).toBe('/cal/event1.ics');
    expect(result!.title).toBe('Team Standup');
    expect(result!.description).toBe('Daily sync meeting');
    expect(result!.location).toBe('Conference Room B');
    expect(result!.iCalUid).toBe('test-uid-123@example.com');
    expect(result!.isCanceled).toBe(false);
    expect(result!.isFullDay).toBe(false);
    expect(result!.status).toBe('CONFIRMED');
    expect(result!.participants).toHaveLength(2);
  });

  it('should handle an event with only required fields', () => {
    const rawData = buildICalEvent({
      SUMMARY: '',
      DESCRIPTION: '',
      LOCATION: '',
      ORGANIZER: '',
      ATTENDEE: '',
    });

    const result = formatCalDavCalendarEvent(rawData, '/cal/minimal.ics');

    expect(result).not.toBeNull();
    expect(result!.title).toBe('Untitled Event');
    expect(result!.description).toBe('');
    expect(result!.location).toBe('');
    expect(result!.participants).toHaveLength(0);
  });

  it('should map cancelled status to isCanceled', () => {
    const rawData = buildICalEvent({ STATUS: 'CANCELLED' });
    const result = formatCalDavCalendarEvent(rawData, '/cal/cancelled.ics');

    expect(result).not.toBeNull();
    expect(result!.isCanceled).toBe(true);
  });

  it('should detect full-day events using VALUE=DATE', () => {
    const rawData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      'UID:fullday@example.com',
      'SUMMARY:All Day Off',
      'DTSTART;VALUE=DATE:20230615',
      'DTEND;VALUE=DATE:20230616',
      'STATUS:CONFIRMED',
      'CREATED:20230601T120000Z',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const result = formatCalDavCalendarEvent(rawData, '/cal/fullday.ics');

    expect(result).not.toBeNull();
    expect(result!.isFullDay).toBe(true);
  });

  it('should sanitize null bytes in string fields', () => {
    const rawData = buildICalEvent({
      SUMMARY: 'Meeting\u0000Title',
    });
    const result = formatCalDavCalendarEvent(rawData, '/cal/dirty.ics');

    expect(result).not.toBeNull();
    expect(result!.title).not.toContain('\u0000');
  });

  it('should return null for non-VEVENT data', () => {
    const rawData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VTODO',
      'UID:todo@example.com',
      'SUMMARY:Buy groceries',
      'END:VTODO',
      'END:VCALENDAR',
    ].join('\r\n');

    const result = formatCalDavCalendarEvent(rawData, '/cal/todo.ics');

    expect(result).toBeNull();
  });

  it('should map attendee PARTSTAT to correct response status', () => {
    const rawData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      'UID:partstat@example.com',
      'SUMMARY:Status Test',
      'DTSTART:20230615T090000Z',
      'DTEND:20230615T100000Z',
      'STATUS:CONFIRMED',
      'CREATED:20230601T120000Z',
      'ATTENDEE;CN=Accepted;PARTSTAT=ACCEPTED:mailto:a@example.com',
      'ATTENDEE;CN=Declined;PARTSTAT=DECLINED:mailto:d@example.com',
      'ATTENDEE;CN=Tentative;PARTSTAT=TENTATIVE:mailto:t@example.com',
      'ATTENDEE;CN=NeedsAction;PARTSTAT=NEEDS-ACTION:mailto:n@example.com',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const result = formatCalDavCalendarEvent(rawData, '/cal/partstat.ics');

    expect(result).not.toBeNull();
    expect(result!.participants).toHaveLength(4);

    const statusMap = new Map(
      result!.participants.map((p) => [p.handle, p.responseStatus]),
    );

    expect(statusMap.get('a@example.com')).toBe(
      CalendarEventParticipantResponseStatus.ACCEPTED,
    );
    expect(statusMap.get('d@example.com')).toBe(
      CalendarEventParticipantResponseStatus.DECLINED,
    );
    expect(statusMap.get('t@example.com')).toBe(
      CalendarEventParticipantResponseStatus.TENTATIVE,
    );
    expect(statusMap.get('n@example.com')).toBe(
      CalendarEventParticipantResponseStatus.NEEDS_ACTION,
    );
  });
});
