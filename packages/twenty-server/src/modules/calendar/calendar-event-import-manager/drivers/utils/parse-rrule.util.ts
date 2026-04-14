import { RRule } from 'rrule';

export const parseRRule = (rruleString: string): string | undefined => {
  if (!rruleString) return undefined;

  try {
    const normalized = rruleString.startsWith('RRULE:')
      ? rruleString
      : `RRULE:${rruleString}`;

    return RRule.fromString(normalized).toText();
  } catch {
    return undefined;
  }
};
