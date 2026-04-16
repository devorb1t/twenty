import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { RecordTableWidgetProvider } from '@/object-record/record-table-widget/components/RecordTableWidgetProvider';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { FieldWidgetRelationTableGatedContent } from '@/page-layout/widgets/field/components/FieldWidgetRelationTableGatedContent';

const StyledContainer = styled.div`
  max-height: 400px;
  overflow: auto;
  width: 100%;
`;

type FieldWidgetRelationTableProps = {
  fieldDefinition: FieldDefinition<FieldRelationMetadata>;
  viewId: string;
  widgetId: string;
  targetRecordId: string;
};

export const FieldWidgetRelationTable = ({
  fieldDefinition,
  viewId,
  widgetId,
  targetRecordId,
}: FieldWidgetRelationTableProps) => {
  const relatedObjectMetadataId =
    fieldDefinition.metadata.relationObjectMetadataId;

  const { objectMetadataItem: relatedObjectMetadataItem } =
    useObjectMetadataItemById({ objectId: relatedObjectMetadataId ?? '' });

  if (!isDefined(relatedObjectMetadataItem)) {
    return null;
  }

  return (
    <StyledContainer>
      <RecordTableWidgetProvider
        objectNameSingular={relatedObjectMetadataItem.nameSingular}
        viewId={viewId}
        widgetId={widgetId}
      >
        <FieldWidgetRelationTableGatedContent
          viewId={viewId}
          widgetId={widgetId}
          inverseRelationFieldMetadataId={
            fieldDefinition.metadata.relationFieldMetadataId
          }
          targetRecordId={targetRecordId}
        />
      </RecordTableWidgetProvider>
    </StyledContainer>
  );
};
