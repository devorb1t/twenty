import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';
import { useFrontComponentExecutionContext } from './useFrontComponentExecutionContext';

const selectNumberOfSelectedRecords = (
  context: FrontComponentExecutionContext,
): number => context.numberOfSelectedRecords;

export const useNumberOfSelectedRecords = (): number => {
  return useFrontComponentExecutionContext(selectNumberOfSelectedRecords);
};
