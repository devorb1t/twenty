import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { isDefined } from 'twenty-shared/utils';

export const resolveWidgetTypeSelectTargetTabId = ({
  pageLayoutEditingWidgetId,
  tabs,
  widgetCreationTargetTabId,
}: {
  pageLayoutEditingWidgetId: string | null;
  tabs: PageLayoutTab[];
  widgetCreationTargetTabId: string | null;
}): string | null => {
  if (isDefined(pageLayoutEditingWidgetId)) {
    const editingWidgetTab = tabs.find((tab) =>
      tab.widgets.some((widget) => widget.id === pageLayoutEditingWidgetId),
    );

    if (!isDefined(editingWidgetTab)) {
      return null;
    }

    return editingWidgetTab.id;
  }

  if (!isDefined(widgetCreationTargetTabId)) {
    return null;
  }

  return widgetCreationTargetTabId;
};
