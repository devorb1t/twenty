import { type ContextStoreViewType } from 'twenty-shared/types';

import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';
import { useFrontComponentExecutionContext } from './useFrontComponentExecutionContext';

const selectViewType = (
  context: FrontComponentExecutionContext,
): ContextStoreViewType | null => context.viewType;

export const useViewType = (): ContextStoreViewType | null => {
  return useFrontComponentExecutionContext(selectViewType);
};
