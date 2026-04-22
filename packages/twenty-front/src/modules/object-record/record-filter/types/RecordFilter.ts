import { type FILTER_OPERANDS_MAP } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { type FilterableAndTSVectorFieldType } from 'twenty-shared/types';

export type { RecordFilter, RLSDynamicValue } from 'twenty-shared/types';

export type RecordFilterToRecordInputOperand<
  T extends FilterableAndTSVectorFieldType,
> = (typeof FILTER_OPERANDS_MAP)[T][number];
