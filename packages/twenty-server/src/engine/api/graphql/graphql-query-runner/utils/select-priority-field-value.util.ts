import { isDefined } from 'twenty-shared/utils';

import { hasRecordFieldValue } from 'src/engine/api/graphql/graphql-query-runner/utils/has-record-field-value.util';

export const selectPriorityFieldValue = <T>(
  recordsWithValues: { value: T; recordId: string }[],
  priorityRecordId: string,
): T | null => {
  const priorityRecord = recordsWithValues.find(
    (record) => record.recordId === priorityRecordId,
  );

  if (!isDefined(priorityRecord)) {
    return null;
  }

  if (hasRecordFieldValue(priorityRecord.value)) {
    return priorityRecord.value;
  }

  return null;
};
