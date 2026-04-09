import { isNonEmptyString } from '@sniptt/guards';

import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

// Reads `record.emails.primaryEmail` defensively. `ObjectRecord` is typed as
// `Record<string, any>` so accessing nested fields is unchecked at compile
// time — we narrow at runtime so callers can rely on a `string | null` result
// without sprinkling `as` casts at every call site.
export const getPrimaryEmailFromRecord = (
  record: ObjectRecord,
): string | null => {
  const emails = record.emails;

  if (emails === null || typeof emails !== 'object') {
    return null;
  }

  const primaryEmail = (emails as { primaryEmail?: unknown }).primaryEmail;

  return isNonEmptyString(primaryEmail) ? primaryEmail : null;
};
