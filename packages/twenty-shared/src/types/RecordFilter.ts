import { type FilterableAndTSVectorFieldType } from './FilterableFieldType';
import { type ViewFilterOperand } from './ViewFilterOperand';

export type RLSDynamicValue = {
  workspaceMemberFieldMetadataId: string;
  workspaceMemberSubFieldName?: string | null;
};

export type RecordFilter = {
  id: string;
  fieldMetadataId: string;
  value: string;
  displayValue: string;
  type: FilterableAndTSVectorFieldType;
  recordFilterGroupId?: string;
  displayAvatarUrl?: string;
  operand: ViewFilterOperand;
  positionInRecordFilterGroup?: number | null;
  label: string;
  subFieldName?: string | null | undefined;
  rlsDynamicValue?: RLSDynamicValue | null;
};
