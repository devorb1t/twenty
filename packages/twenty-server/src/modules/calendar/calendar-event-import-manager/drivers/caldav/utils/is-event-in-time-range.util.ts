export const isEventInTimeRange = (
  event: { startsAt: string; endsAt: string },
  startDate: Date,
  endDate: Date,
): boolean => {
  const eventStart = new Date(event.startsAt);
  const eventEnd = new Date(event.endsAt);

  return eventStart < endDate && eventEnd > startDate;
};
