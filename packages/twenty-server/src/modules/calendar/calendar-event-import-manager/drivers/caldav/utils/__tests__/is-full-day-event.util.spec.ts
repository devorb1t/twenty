import { isFullDayEvent } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/is-full-day-event.util';

describe('isFullDayEvent', () => {
  it('should return true for VALUE=DATE in DTSTART', () => {
    const rawData = [
      'BEGIN:VEVENT',
      'DTSTART;VALUE=DATE:20230615',
      'DTEND;VALUE=DATE:20230616',
      'END:VEVENT',
    ].join('\r\n');

    expect(isFullDayEvent(rawData)).toBe(true);
  });

  it('should return false for datetime DTSTART', () => {
    const rawData = [
      'BEGIN:VEVENT',
      'DTSTART:20230615T090000Z',
      'DTEND:20230615T100000Z',
      'END:VEVENT',
    ].join('\r\n');

    expect(isFullDayEvent(rawData)).toBe(false);
  });

  it('should return false for DTSTART with TZID', () => {
    const rawData = [
      'BEGIN:VEVENT',
      'DTSTART;TZID=America/New_York:20230615T090000',
      'DTEND;TZID=America/New_York:20230615T100000',
      'END:VEVENT',
    ].join('\r\n');

    expect(isFullDayEvent(rawData)).toBe(false);
  });

  it('should handle LF-only line endings', () => {
    const rawData = [
      'BEGIN:VEVENT',
      'DTSTART;VALUE=DATE:20230615',
      'END:VEVENT',
    ].join('\n');

    expect(isFullDayEvent(rawData)).toBe(true);
  });
});
