import { type RecordGqlOperationFilter } from 'twenty-shared/types';

import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';
import { useFrontComponentExecutionContext } from './useFrontComponentExecutionContext';

const selectGraphqlFilter = (
  context: FrontComponentExecutionContext,
): RecordGqlOperationFilter | null => context.graphqlFilter;

export const useGraphqlFilter = (): RecordGqlOperationFilter | null => {
  return useFrontComponentExecutionContext(selectGraphqlFilter);
};
