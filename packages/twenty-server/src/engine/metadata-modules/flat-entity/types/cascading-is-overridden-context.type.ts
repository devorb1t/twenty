import { type FlatPageLayoutWidgetMaps } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-maps.type';
import { type FlatViewFieldGroupMaps } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group-maps.type';
import { type FlatViewFieldMaps } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field-maps.type';

export type CascadingIsOverriddenContext = {
  flatViewFieldGroupMaps: FlatViewFieldGroupMaps;
  flatViewFieldMaps: FlatViewFieldMaps;
  flatPageLayoutWidgetMaps: FlatPageLayoutWidgetMaps;
  workspaceCustomApplicationUniversalIdentifier: string;
};
