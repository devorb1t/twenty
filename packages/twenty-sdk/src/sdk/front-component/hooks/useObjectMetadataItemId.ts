import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';
import { useFrontComponentExecutionContext } from './useFrontComponentExecutionContext';

const selectObjectMetadataItemId = (
  context: FrontComponentExecutionContext,
): string | null => context.objectMetadataItemId;

export const useObjectMetadataItemId = (): string | null => {
  return useFrontComponentExecutionContext(selectObjectMetadataItemId);
};
