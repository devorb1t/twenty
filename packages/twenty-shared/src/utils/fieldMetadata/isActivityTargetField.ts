import { CoreObjectNameSingular } from '@/types';

export const isActivityTargetField = (
  fieldName: string,
  objectNameSingular: string,
): boolean =>
  (objectNameSingular === CoreObjectNameSingular.Note &&
    fieldName === 'noteTargets') ||
  (objectNameSingular === CoreObjectNameSingular.Task &&
    fieldName === 'taskTargets');
