export type WidgetActionId = 'edit' | 'see-all' | 'fields';

export type WidgetAction = {
  id: WidgetActionId;
  position: number;
};
