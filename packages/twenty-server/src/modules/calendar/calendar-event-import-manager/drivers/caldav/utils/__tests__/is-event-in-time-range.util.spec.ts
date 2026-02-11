import { isEventInTimeRange } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/is-event-in-time-range.util';

describe('isEventInTimeRange', () => {
  const rangeStart = new Date('2023-06-01T00:00:00Z');
  const rangeEnd = new Date('2023-06-30T23:59:59Z');

  it('should return true when event is fully within range', () => {
    const event = {
      startsAt: '2023-06-10T09:00:00.000Z',
      endsAt: '2023-06-10T10:00:00.000Z',
    };

    expect(isEventInTimeRange(event, rangeStart, rangeEnd)).toBe(true);
  });

  it('should return false when event ends before range starts', () => {
    const event = {
      startsAt: '2023-05-01T09:00:00.000Z',
      endsAt: '2023-05-01T10:00:00.000Z',
    };

    expect(isEventInTimeRange(event, rangeStart, rangeEnd)).toBe(false);
  });

  it('should return false when event starts after range ends', () => {
    const event = {
      startsAt: '2023-07-15T09:00:00.000Z',
      endsAt: '2023-07-15T10:00:00.000Z',
    };

    expect(isEventInTimeRange(event, rangeStart, rangeEnd)).toBe(false);
  });

  it('should return true when event overlaps the start of the range', () => {
    const event = {
      startsAt: '2023-05-30T09:00:00.000Z',
      endsAt: '2023-06-02T10:00:00.000Z',
    };

    expect(isEventInTimeRange(event, rangeStart, rangeEnd)).toBe(true);
  });

  it('should return true when event overlaps the end of the range', () => {
    const event = {
      startsAt: '2023-06-29T09:00:00.000Z',
      endsAt: '2023-07-05T10:00:00.000Z',
    };

    expect(isEventInTimeRange(event, rangeStart, rangeEnd)).toBe(true);
  });

  it('should return true when event spans the entire range', () => {
    const event = {
      startsAt: '2023-05-01T00:00:00.000Z',
      endsAt: '2023-07-31T23:59:59.000Z',
    };

    expect(isEventInTimeRange(event, rangeStart, rangeEnd)).toBe(true);
  });

  it('should return false when event ends exactly at range start', () => {
    const event = {
      startsAt: '2023-05-31T09:00:00.000Z',
      endsAt: '2023-06-01T00:00:00.000Z',
    };

    expect(isEventInTimeRange(event, rangeStart, rangeEnd)).toBe(false);
  });
});
