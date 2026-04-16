import { Temporal } from 'temporal-polyfill';

import { resolveRelativeDateFilter } from '@/utils/filter/dates/utils/resolveRelativeDateFilter';

describe('resolveRelativeDateFilter', () => {
  const referenceZdt = Temporal.ZonedDateTime.from('2024-03-15T12:00:00[UTC]');

  describe('NEXT direction', () => {
    it('should compute start and end for NEXT 7 DAY', () => {
      const result = resolveRelativeDateFilter(
        { direction: 'NEXT', amount: 7, unit: 'DAY' },
        referenceZdt,
      );

      expect(result.start).toBe('2024-03-16');
      expect(result.end).toBe('2024-03-23');
    });

    it('should compute calendar-aligned start and end for NEXT 1 WEEK', () => {
      const result = resolveRelativeDateFilter(
        { direction: 'NEXT', amount: 1, unit: 'WEEK' },
        referenceZdt,
      );

      // Mar 15 is Friday, next week starts Monday Mar 18
      expect(result.start).toBe('2024-03-18');
      expect(result.end).toBe('2024-03-25');
    });

    it('should compute calendar-aligned start and end for NEXT 1 MONTH', () => {
      const result = resolveRelativeDateFilter(
        { direction: 'NEXT', amount: 1, unit: 'MONTH' },
        referenceZdt,
      );

      expect(result.start).toBe('2024-04-01');
      expect(result.end).toBe('2024-05-01');
    });

    it('should compute calendar-aligned start and end for NEXT 1 YEAR', () => {
      const result = resolveRelativeDateFilter(
        { direction: 'NEXT', amount: 1, unit: 'YEAR' },
        referenceZdt,
      );

      expect(result.start).toBe('2025-01-01');
      expect(result.end).toBe('2026-01-01');
    });

    it('should throw if amount is undefined', () => {
      expect(() =>
        resolveRelativeDateFilter(
          { direction: 'NEXT', amount: undefined as any, unit: 'DAY' },
          referenceZdt,
        ),
      ).toThrow('Amount is required');
    });
  });

  describe('PAST direction', () => {
    it('should compute start and end for PAST 7 DAY', () => {
      const result = resolveRelativeDateFilter(
        { direction: 'PAST', amount: 7, unit: 'DAY' },
        referenceZdt,
      );

      expect(result.start).toBe('2024-03-08');
      expect(result.end).toBe('2024-03-15');
    });

    it('should compute calendar-aligned start and end for PAST 1 WEEK', () => {
      const result = resolveRelativeDateFilter(
        { direction: 'PAST', amount: 1, unit: 'WEEK' },
        referenceZdt,
      );

      // Mar 15 is Friday, current week starts Monday Mar 11, past 1 week = Mar 4-11
      expect(result.start).toBe('2024-03-04');
      expect(result.end).toBe('2024-03-11');
    });

    it('should compute calendar-aligned start and end for PAST 1 MONTH', () => {
      const result = resolveRelativeDateFilter(
        { direction: 'PAST', amount: 1, unit: 'MONTH' },
        referenceZdt,
      );

      // Current month starts Mar 1, past 1 month = Feb 1-Mar 1
      expect(result.start).toBe('2024-02-01');
      expect(result.end).toBe('2024-03-01');
    });

    it('should compute calendar-aligned start and end for PAST 1 YEAR', () => {
      const result = resolveRelativeDateFilter(
        { direction: 'PAST', amount: 1, unit: 'YEAR' },
        referenceZdt,
      );

      // Current year starts Jan 1 2024, past 1 year = Jan 1 2023-Jan 1 2024
      expect(result.start).toBe('2023-01-01');
      expect(result.end).toBe('2024-01-01');
    });

    it('should throw if amount is undefined', () => {
      expect(() =>
        resolveRelativeDateFilter(
          { direction: 'PAST', amount: undefined as any, unit: 'DAY' },
          referenceZdt,
        ),
      ).toThrow('Amount is required');
    });
  });

  describe('THIS direction', () => {
    it('should compute start and end for THIS MONTH', () => {
      const result = resolveRelativeDateFilter(
        { direction: 'THIS', amount: 1, unit: 'MONTH' },
        referenceZdt,
      );

      expect(result.start).toBe('2024-03-01');
      expect(result.end).toBe('2024-04-01');
    });

    it('should compute start and end for THIS YEAR', () => {
      const result = resolveRelativeDateFilter(
        { direction: 'THIS', amount: 1, unit: 'YEAR' },
        referenceZdt,
      );

      expect(result.start).toBe('2024-01-01');
      expect(result.end).toBe('2025-01-01');
    });

    it('should compute start and end for THIS QUARTER', () => {
      const result = resolveRelativeDateFilter(
        { direction: 'THIS', amount: 1, unit: 'QUARTER' },
        referenceZdt,
      );

      expect(result.start).toBe('2024-01-01');
      expect(result.end).toBe('2024-04-01');
    });

    it('should compute start and end for PAST 1 QUARTER', () => {
      const result = resolveRelativeDateFilter(
        { direction: 'PAST', amount: 1, unit: 'QUARTER' },
        referenceZdt,
      );

      expect(result.start).toBe('2023-10-01');
      expect(result.end).toBe('2024-01-01');
    });

    it('should compute start and end for NEXT 1 QUARTER', () => {
      const result = resolveRelativeDateFilter(
        { direction: 'NEXT', amount: 1, unit: 'QUARTER' },
        referenceZdt,
      );

      expect(result.start).toBe('2024-04-01');
      expect(result.end).toBe('2024-07-01');
    });
  });
});
