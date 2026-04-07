import { isDefined } from 'twenty-shared/utils';

import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';

const hasNonEmptyOverrides = (entity: { overrides: unknown }): boolean =>
  isDefined(entity.overrides) &&
  typeof entity.overrides === 'object' &&
  entity.overrides !== null &&
  Object.keys(entity.overrides).length > 0;

export const computeTabCascadingIsOverridden = ({
  tab,
  childWidgets,
  widgetCascadingIsOverriddenById,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  tab: FlatPageLayoutTab;
  childWidgets: FlatPageLayoutWidget[];
  widgetCascadingIsOverriddenById: Record<string, boolean>;
  workspaceCustomApplicationUniversalIdentifier: string;
}): boolean => {
  if (
    tab.applicationUniversalIdentifier ===
    workspaceCustomApplicationUniversalIdentifier
  ) {
    return false;
  }

  if (hasNonEmptyOverrides(tab)) {
    return true;
  }

  for (const widget of childWidgets) {
    if (
      widget.applicationUniversalIdentifier ===
      workspaceCustomApplicationUniversalIdentifier
    ) {
      return true;
    }

    if (!widget.isActive || hasNonEmptyOverrides(widget)) {
      return true;
    }

    if (widgetCascadingIsOverriddenById[widget.id] === true) {
      return true;
    }
  }

  return false;
};
