type ContextStoreTargetedRecordsRuleSelectionMode = {
  mode: 'selection';
  selectedRecordIds: string[];
};

type ContextStoreTargetedRecordsRuleExclusionMode = {
  mode: 'exclusion';
  excludedRecordIds: string[];
};

export type ContextStoreTargetedRecordsRule =
  | ContextStoreTargetedRecordsRuleSelectionMode
  | ContextStoreTargetedRecordsRuleExclusionMode;
