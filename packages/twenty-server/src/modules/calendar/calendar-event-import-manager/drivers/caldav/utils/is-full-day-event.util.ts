// node-ical converts all dates to JavaScript Date objects, losing the VALUE=DATE
// distinction. We inspect the raw iCal text to detect full-day events.
export const isFullDayEvent = (rawICalData: string): boolean => {
  const lines = rawICalData.split(/\r?\n/);

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (
      trimmedLine.startsWith('DTSTART') &&
      trimmedLine.includes('VALUE=DATE')
    ) {
      return true;
    }
  }

  return false;
};
