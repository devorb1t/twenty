import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

export const matchesRecordShowPathForObject = (
  pathname: string,
  objectNameSingular: string,
): boolean => {
  const recordShowBase = getAppPath(AppPath.RecordShowPage, {
    objectNameSingular,
    objectRecordId: '',
  });

  return pathname.startsWith(`${recordShowBase}/`);
};
