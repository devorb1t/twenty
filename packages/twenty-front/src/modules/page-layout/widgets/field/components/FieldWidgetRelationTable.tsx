import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { RecordTableWidget } from '@/object-record/record-table-widget/components/RecordTableWidget';
import { RecordTableWidgetProvider } from '@/object-record/record-table-widget/components/RecordTableWidgetProvider';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';

const StyledContainer = styled.div`
  width: 100%;
  max-height: 400px;
  overflow: auto;
`;

type FieldWidgetRelationTableProps = {
  fieldDefinition: FieldDefinition<FieldRelationMetadata>;
  viewId: string;
  widgetId: string;
};

export const FieldWidgetRelationTable = ({
  fieldDefinition,
  viewId,
  widgetId,
}: FieldWidgetRelationTableProps) => {
  const relatedObjectMetadataId =
    fieldDefinition.metadata.relationObjectMetadataId;

  const { objectMetadataItem: relatedObjectMetadataItem } =
    useObjectMetadataItemById({ objectId: relatedObjectMetadataId ?? '' });

  if (!isDefined(relatedObjectMetadataItem)) {
    return null;
  }

  // TODO: scope the table to records where the inverse relation
  // (fieldDefinition.metadata.relationFieldMetadataId) points at the current
  // target record. This requires injecting an implicit filter into the
  // RecordTableWidget query layer, which the existing provider does not yet
  // expose as a prop.
  return (
    <StyledContainer>
      <RecordTableWidgetProvider
        objectNameSingular={relatedObjectMetadataItem.nameSingular}
        viewId={viewId}
        widgetId={widgetId}
      >
        <RecordTableWidget />
      </RecordTableWidgetProvider>
    </StyledContainer>
  );
};
