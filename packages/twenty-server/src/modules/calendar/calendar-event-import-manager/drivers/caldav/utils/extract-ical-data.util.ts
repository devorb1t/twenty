const MAX_EXTRACTION_DEPTH = 10;

export const extractICalData = (
  calendarData: string | Record<string, unknown>,
  depth: number = MAX_EXTRACTION_DEPTH,
): string | null => {
  if (!calendarData || depth <= 0) return null;

  if (typeof calendarData === 'string' && calendarData.includes('VCALENDAR')) {
    return calendarData;
  }

  if (typeof calendarData === 'object' && calendarData !== null) {
    for (const key in calendarData) {
      const result = extractICalData(
        calendarData[key] as string | Record<string, unknown>,
        depth - 1,
      );

      if (result) return result;
    }
  }

  return null;
};
