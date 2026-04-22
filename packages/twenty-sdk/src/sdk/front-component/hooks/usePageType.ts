import { type ContextStorePageType } from 'twenty-shared/types';

import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';
import { useFrontComponentExecutionContext } from './useFrontComponentExecutionContext';

const selectPageType = (
  context: FrontComponentExecutionContext,
): ContextStorePageType | null => context.pageType;

export const usePageType = (): ContextStorePageType | null => {
  return useFrontComponentExecutionContext(selectPageType);
};
