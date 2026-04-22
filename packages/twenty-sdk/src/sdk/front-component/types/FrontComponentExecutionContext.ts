import {
  type ContextStorePageType,
  type ContextStoreViewType,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';

export type FrontComponentExecutionContext = {
  frontComponentId: string;
  userId: string | null;
  recordId: string | null;
  pageType: ContextStorePageType | null;
  viewType: ContextStoreViewType | null;
  viewId: string | null;
  objectMetadataItemId: string | null;
  numberOfSelectedRecords: number;
  graphqlFilter: RecordGqlOperationFilter | null;
};
