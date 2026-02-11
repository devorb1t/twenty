import { extractICalData } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/extract-ical-data.util';

describe('extractICalData', () => {
  it('should return a plain string containing VCALENDAR as-is', () => {
    const data =
      'BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nEND:VEVENT\r\nEND:VCALENDAR';

    expect(extractICalData(data)).toBe(data);
  });

  it('should extract iCal data nested under _cdata', () => {
    const nested = {
      _cdata: 'BEGIN:VCALENDAR\r\nEND:VCALENDAR',
    };

    expect(extractICalData(nested)).toBe('BEGIN:VCALENDAR\r\nEND:VCALENDAR');
  });

  it('should extract from deeply nested objects', () => {
    const deeplyNested = {
      wrapper: {
        inner: {
          content: 'BEGIN:VCALENDAR\r\nEND:VCALENDAR',
        },
      },
    };

    expect(extractICalData(deeplyNested)).toBe(
      'BEGIN:VCALENDAR\r\nEND:VCALENDAR',
    );
  });

  it('should return null for a string without VCALENDAR', () => {
    expect(extractICalData('just some text')).toBeNull();
  });

  it('should return null for empty input', () => {
    expect(extractICalData('')).toBeNull();
  });

  it('should return null when depth limit is exceeded', () => {
    const nested = {
      a: { b: { c: { d: 'BEGIN:VCALENDAR\r\nEND:VCALENDAR' } } },
    };

    expect(extractICalData(nested, 4)).toBeNull();
    expect(extractICalData(nested, 5)).toBe('BEGIN:VCALENDAR\r\nEND:VCALENDAR');
  });
});
