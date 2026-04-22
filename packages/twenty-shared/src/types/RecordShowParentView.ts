import { type RecordFilter } from './RecordFilter';
import { type RecordFilterGroup } from './RecordFilterGroup';
import { type RecordSort } from './RecordSort';

export type RecordShowParentView = {
  parentViewComponentId: string;
  parentViewObjectNameSingular: string;
  parentViewFilterGroups: RecordFilterGroup[];
  parentViewFilters: RecordFilter[];
  parentViewSorts: RecordSort[];
};
