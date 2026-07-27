import { isDefined } from 'twenty-shared/utils';

type ExtractRecordIdsAndDatesOptions = {
  // Foreign-key aggregator collections (e.g. viewFieldIds,
  // viewFieldUniversalIdentifiers) hold random primary keys and identifiers
  // derived from them, so they are non-deterministic across runs. Opt in to
  // normalize them; off by default to keep existing snapshots untouched.
  normalizeIdCollections?: boolean;
};

export const extractRecordIdsAndDatesAsExpectAny = (
  record: Record<string, unknown> | Array<Record<string, unknown>>,
  options: ExtractRecordIdsAndDatesOptions = {},
): any => {
  if (Array.isArray(record)) {
    return record.map((item) =>
      extractRecordIdsAndDatesAsExpectAny(item, options),
    );
  }

  if (typeof record !== 'object') {
    return record;
  }

  return Object.entries(record).reduce((acc, [key, value]) => {
    if (!isDefined(value)) {
      return acc;
    }

    if (value instanceof Date) {
      return {
        ...acc,
        [key]: expect.any(Date),
      };
    }

    if (
      key.endsWith('Id') ||
      key.endsWith('UniversalIdentifier') ||
      key === 'universalIdentifier' ||
      key === 'id' ||
      key === 'updatedAt' ||
      key === 'deletedAt' ||
      key === 'createdAt'
    ) {
      return {
        ...acc,
        [key]:
          typeof value === 'object' ? expect.any(Object) : expect.any(String),
      };
    }

    if (
      options.normalizeIdCollections &&
      Array.isArray(value) &&
      (key.endsWith('Ids') || key.endsWith('UniversalIdentifiers'))
    ) {
      return {
        ...acc,
        [key]: expect.any(Array),
      };
    }

    if (typeof value === 'object' || Array.isArray(value)) {
      return {
        ...acc,
        [key]: extractRecordIdsAndDatesAsExpectAny(
          value as Record<string, unknown>,
          options,
        ),
      };
    }

    return acc;
  }, {});
};
