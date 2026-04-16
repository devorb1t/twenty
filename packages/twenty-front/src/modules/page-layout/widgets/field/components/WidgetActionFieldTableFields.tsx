import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { type FieldRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { useResolveFieldMetadataIdFromNameOrId } from '@/page-layout/hooks/useResolveFieldMetadataIdFromNameOrId';
import { FieldWidgetTableFieldsDropdownContent } from '@/page-layout/widgets/field/components/FieldWidgetTableFieldsDropdownContent';
import { isFieldWidget } from '@/page-layout/widgets/field/utils/isFieldWidget';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { isDefined } from 'twenty-shared/utils';
import { IconListDetails } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';

export const WidgetActionFieldTableFields = () => {
  const widget = useCurrentWidget();
  const targetRecord = useTargetRecord();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });

  const fieldMetadataId = isFieldWidget(widget)
    ? widget.configuration.fieldMetadataId
    : undefined;

  const resolvedFieldMetadataId = useResolveFieldMetadataIdFromNameOrId(
    fieldMetadataId ?? '',
  );

  const { fieldMetadataItem } = useFieldMetadataItemById(
    resolvedFieldMetadataId ?? '',
  );

  const fieldDefinition = isDefined(fieldMetadataItem)
    ? formatFieldMetadataItemAsColumnDefinition({
        field: fieldMetadataItem,
        position: 0,
        objectMetadataItem,
        showLabel: true,
        labelWidth: 90,
      })
    : null;

  const relationMetadata =
    isDefined(fieldDefinition) && isFieldRelation(fieldDefinition)
      ? (fieldDefinition.metadata as FieldRelationMetadata)
      : null;

  const { objectMetadataItems } = useObjectMetadataItems();

  const relatedObjectMetadataItem = objectMetadataItems.find(
    (item) =>
      item.nameSingular ===
      relationMetadata?.relationObjectMetadataNameSingular,
  );

  const viewId = isFieldWidget(widget)
    ? widget.configuration.viewId
    : undefined;

  if (
    !isDefined(relationMetadata) ||
    !isDefined(relatedObjectMetadataItem) ||
    !isDefined(viewId)
  ) {
    return null;
  }

  const dropdownId = `widget-table-fields-${widget.id}`;

  return (
    <div onClick={(event) => event.stopPropagation()}>
      <Dropdown
        dropdownId={dropdownId}
        clickableComponent={
          <LightIconButton Icon={IconListDetails} accent="secondary" />
        }
        dropdownPlacement="bottom-end"
        dropdownComponents={
          <FieldWidgetTableFieldsDropdownContent
            viewId={viewId}
            widgetId={widget.id}
            objectMetadataId={relatedObjectMetadataItem.id}
          />
        }
      />
    </div>
  );
};
