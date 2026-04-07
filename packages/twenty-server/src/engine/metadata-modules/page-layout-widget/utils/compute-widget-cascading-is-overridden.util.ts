import { isDefined } from 'twenty-shared/utils';

import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { isFlatPageLayoutWidgetConfigurationOfType } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/is-flat-page-layout-widget-configuration-of-type.util';
import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

const hasNonEmptyOverrides = (entity: { overrides: unknown }): boolean =>
  isDefined(entity.overrides) &&
  typeof entity.overrides === 'object' &&
  entity.overrides !== null &&
  Object.keys(entity.overrides).length > 0;

export const computeWidgetCascadingIsOverridden = ({
  widget,
  flatViewFieldGroupMaps,
  flatViewFieldMaps,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  widget: FlatPageLayoutWidget;
  flatViewFieldGroupMaps: {
    byUniversalIdentifier: Partial<
      Record<string, FlatViewFieldGroup | undefined>
    >;
  };
  flatViewFieldMaps: {
    byUniversalIdentifier: Partial<Record<string, FlatViewField | undefined>>;
  };
  workspaceCustomApplicationUniversalIdentifier: string;
}): boolean => {
  if (
    widget.applicationUniversalIdentifier ===
    workspaceCustomApplicationUniversalIdentifier
  ) {
    return false;
  }

  if (hasNonEmptyOverrides(widget)) {
    return true;
  }

  if (
    !isFlatPageLayoutWidgetConfigurationOfType(
      widget,
      WidgetConfigurationType.FIELDS,
    )
  ) {
    return false;
  }

  const viewId = widget.configuration.viewId;

  if (!isDefined(viewId)) {
    return false;
  }

  const viewFieldGroups = Object.values(
    flatViewFieldGroupMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter((group) => group.viewId === viewId && !isDefined(group.deletedAt));

  for (const group of viewFieldGroups) {
    if (
      group.applicationUniversalIdentifier ===
      workspaceCustomApplicationUniversalIdentifier
    ) {
      return true;
    }

    if (!group.isActive || hasNonEmptyOverrides(group)) {
      return true;
    }
  }

  const viewFields = Object.values(flatViewFieldMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter((field) => field.viewId === viewId && !isDefined(field.deletedAt));

  for (const field of viewFields) {
    if (
      field.applicationUniversalIdentifier ===
      workspaceCustomApplicationUniversalIdentifier
    ) {
      return true;
    }

    if (!field.isActive || hasNonEmptyOverrides(field)) {
      return true;
    }
  }

  return false;
};
