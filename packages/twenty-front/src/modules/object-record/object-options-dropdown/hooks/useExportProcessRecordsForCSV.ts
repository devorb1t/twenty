import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type FieldCurrencyValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldCurrencyValue } from '@/object-record/record-field/ui/types/guards/isFieldCurrencyValue';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { convertCurrencyMicrosToCurrencyAmount } from '~/utils/convertCurrencyToCurrencyMicros';

export const useExportProcessRecordsForCSV = (objectNameSingular: string) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const processRecordsForCSVExport = (records: ObjectRecord[]) => {
    return records.map((record) =>
      objectMetadataItem.fields.reduce(
        (processedRecord, field) => {
          if (!isDefined(record[field.name])) {
            return processedRecord;
          }

          switch (field.type) {
            case FieldMetadataType.CURRENCY: {
              const currencyValue = record[field.name];
              if (!isFieldCurrencyValue(currencyValue)) {
                return processedRecord;
              }
              return {
                ...processedRecord,
                [field.name]: {
                  amountMicros:
                    currencyValue.amountMicros !== null
                      ? convertCurrencyMicrosToCurrencyAmount(
                          currencyValue.amountMicros,
                        )
                      : null,
                  currencyCode: currencyValue.currencyCode,
                } satisfies FieldCurrencyValue,
              };
            }
            case FieldMetadataType.MULTI_SELECT:
            case FieldMetadataType.ARRAY:
            case FieldMetadataType.RAW_JSON:
            case FieldMetadataType.FILES:
              return {
                ...processedRecord,
                [field.name]: JSON.stringify(record[field.name]),
              };
            default:
              return processedRecord;
          }
        },
        { ...record },
      ),
    );
  };

  return { processRecordsForCSVExport };
};
