import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';
import { useFrontComponentExecutionContext } from './useFrontComponentExecutionContext';

const selectViewId = (
  context: FrontComponentExecutionContext,
): string | null => context.viewId;

export const useViewId = (): string | null => {
  return useFrontComponentExecutionContext(selectViewId);
};
