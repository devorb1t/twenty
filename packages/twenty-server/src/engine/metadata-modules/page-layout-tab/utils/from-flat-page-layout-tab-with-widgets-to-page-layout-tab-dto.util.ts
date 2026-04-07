import { type CascadingIsOverriddenContext } from 'src/engine/metadata-modules/flat-entity/types/cascading-is-overridden-context.type';
import { type FlatPageLayoutTabWithWidgets } from 'src/engine/metadata-modules/flat-page-layout-tab/utils/reconstruct-flat-page-layout-tab-with-widgets.util';
import { type PageLayoutTabDTO } from 'src/engine/metadata-modules/page-layout-tab/dtos/page-layout-tab.dto';
import { computeTabCascadingIsOverridden } from 'src/engine/metadata-modules/page-layout-tab/utils/compute-tab-cascading-is-overridden.util';
import { fromFlatPageLayoutTabToPageLayoutTabDto } from 'src/engine/metadata-modules/page-layout-tab/utils/from-flat-page-layout-tab-to-page-layout-tab-dto.util';
import { sortWidgetDtosByPosition } from 'src/engine/metadata-modules/page-layout-widget/utils/sort-widget-dtos-by-position.util';
import { computeWidgetCascadingIsOverridden } from 'src/engine/metadata-modules/page-layout-widget/utils/compute-widget-cascading-is-overridden.util';
import { fromFlatPageLayoutWidgetToPageLayoutWidgetDto } from 'src/engine/metadata-modules/page-layout-widget/utils/from-flat-page-layout-widget-to-page-layout-widget-dto.util';

export const fromFlatPageLayoutTabWithWidgetsToPageLayoutTabDto = (
  flatPageLayoutTabWithWidgets: FlatPageLayoutTabWithWidgets,
  cascadingContext?: CascadingIsOverriddenContext,
): PageLayoutTabDTO => {
  const { widgets, ...flatPageLayoutTab } = flatPageLayoutTabWithWidgets;

  if (!cascadingContext) {
    const widgetDtos = widgets.map((widget) =>
      fromFlatPageLayoutWidgetToPageLayoutWidgetDto(widget),
    );

    return {
      ...fromFlatPageLayoutTabToPageLayoutTabDto(flatPageLayoutTab),
      widgets: sortWidgetDtosByPosition(widgetDtos),
    };
  }

  const widgetCascadingIsOverriddenById: Record<string, boolean> = {};

  const widgetDtos = widgets.map((widget) => {
    const isOverridden = computeWidgetCascadingIsOverridden({
      widget,
      flatViewFieldGroupMaps: cascadingContext.flatViewFieldGroupMaps,
      flatViewFieldMaps: cascadingContext.flatViewFieldMaps,
      workspaceCustomApplicationUniversalIdentifier:
        cascadingContext.workspaceCustomApplicationUniversalIdentifier,
    });

    widgetCascadingIsOverriddenById[widget.id] = isOverridden;

    return fromFlatPageLayoutWidgetToPageLayoutWidgetDto(widget, isOverridden);
  });

  const tabIsOverridden = computeTabCascadingIsOverridden({
    tab: flatPageLayoutTab,
    childWidgets: widgets,
    widgetCascadingIsOverriddenById,
    workspaceCustomApplicationUniversalIdentifier:
      cascadingContext.workspaceCustomApplicationUniversalIdentifier,
  });

  return {
    ...fromFlatPageLayoutTabToPageLayoutTabDto(
      flatPageLayoutTab,
      tabIsOverridden,
    ),
    widgets: sortWidgetDtosByPosition(widgetDtos),
  };
};
