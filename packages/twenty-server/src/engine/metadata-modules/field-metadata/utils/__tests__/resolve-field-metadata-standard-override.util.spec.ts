import { type I18n } from '@lingui/core';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { translateStandardMetadataLabel } from 'src/engine/core-modules/i18n/standard-metadata-descriptor-registry/translate-standard-metadata-label.util';
import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { resolveFieldMetadataStandardOverride } from 'src/engine/metadata-modules/field-metadata/utils/resolve-field-metadata-standard-override.util';

jest.mock(
  'src/engine/core-modules/i18n/standard-metadata-descriptor-registry/translate-standard-metadata-label.util',
  () => ({
    translateStandardMetadataLabel: jest.fn(),
  }),
);

const mockTranslateStandardMetadataLabel =
  translateStandardMetadataLabel as jest.MockedFunction<
    typeof translateStandardMetadataLabel
  >;

type FieldFixture = Pick<
  FieldMetadataDTO,
  'label' | 'description' | 'icon' | 'isCustom' | 'standardOverrides'
>;

const baseFixture = (overrides: Partial<FieldFixture> = {}): FieldFixture => ({
  label: 'Standard Label',
  description: 'Standard Description',
  icon: 'default-icon',
  isCustom: false,
  standardOverrides: undefined,
  ...overrides,
});

describe('resolveFieldMetadataStandardOverride', () => {
  let mockI18n: jest.Mocked<I18n>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockI18n = {
      _: jest.fn(),
    } as unknown as jest.Mocked<I18n>;
    mockTranslateStandardMetadataLabel.mockReturnValue(undefined);
  });

  describe('Custom fields', () => {
    it('should return the field value for custom label field', () => {
      const fieldMetadata = baseFixture({
        label: 'Custom Label',
        isCustom: true,
      });

      const result = resolveFieldMetadataStandardOverride(
        fieldMetadata,
        'label',
        'fr-FR',
        mockI18n,
      );

      expect(result).toBe('Custom Label');
    });

    it('should return the field value for custom description field', () => {
      const fieldMetadata = baseFixture({
        description: 'Custom Description',
        isCustom: true,
      });

      const result = resolveFieldMetadataStandardOverride(
        fieldMetadata,
        'description',
        undefined,
        mockI18n,
      );

      expect(result).toBe('Custom Description');
    });

    it('should return the field value for custom icon field', () => {
      const fieldMetadata = baseFixture({
        icon: 'custom-icon',
        isCustom: true,
      });

      const result = resolveFieldMetadataStandardOverride(
        fieldMetadata,
        'icon',
        SOURCE_LOCALE,
        mockI18n,
      );

      expect(result).toBe('custom-icon');
    });
  });

  describe('Standard fields - Icon overrides', () => {
    it('should return override icon when available for standard field', () => {
      const fieldMetadata = baseFixture({
        standardOverrides: { icon: 'override-icon' },
      });

      const result = resolveFieldMetadataStandardOverride(
        fieldMetadata,
        'icon',
        'fr-FR',
        mockI18n,
      );

      expect(result).toBe('override-icon');
    });
  });

  describe('Standard fields - Translation overrides', () => {
    it('should return translation override when available for non-icon fields', () => {
      const fieldMetadata = baseFixture({
        standardOverrides: {
          translations: {
            'fr-FR': {
              label: 'Libellé traduit',
              description: 'Description traduite',
            },
          },
        },
      });

      expect(
        resolveFieldMetadataStandardOverride(
          fieldMetadata,
          'label',
          'fr-FR',
          mockI18n,
        ),
      ).toBe('Libellé traduit');
      expect(
        resolveFieldMetadataStandardOverride(
          fieldMetadata,
          'description',
          'fr-FR',
          mockI18n,
        ),
      ).toBe('Description traduite');
    });

    it('should fallback when translation override is not available for the locale', () => {
      const fieldMetadata = baseFixture({
        standardOverrides: {
          translations: {
            'es-ES': { label: 'Etiqueta en español' },
          },
        },
      });

      const result = resolveFieldMetadataStandardOverride(
        fieldMetadata,
        'label',
        'fr-FR',
        mockI18n,
      );

      expect(result).toBe('Standard Label');
    });

    it('should fallback when translation override is not available for the labelKey', () => {
      const fieldMetadata = baseFixture({
        standardOverrides: {
          translations: {
            'fr-FR': { label: 'Libellé traduit' },
          },
        },
      });

      const result = resolveFieldMetadataStandardOverride(
        fieldMetadata,
        'description',
        'fr-FR',
        mockI18n,
      );

      expect(result).toBe('Standard Description');
    });

    it('should not use translation overrides when locale is undefined', () => {
      const fieldMetadata = baseFixture({
        standardOverrides: {
          translations: {
            'fr-FR': { label: 'Libellé traduit' },
          },
        },
      });

      const result = resolveFieldMetadataStandardOverride(
        fieldMetadata,
        'label',
        undefined,
        mockI18n,
      );

      expect(result).toBe('Standard Label');
    });
  });

  describe('Standard fields - SOURCE_LOCALE overrides', () => {
    it('should return direct override for SOURCE_LOCALE when available', () => {
      const fieldMetadata = baseFixture({
        standardOverrides: {
          label: 'Overridden Label',
          description: 'Overridden Description',
          icon: 'overridden-icon',
        },
      });

      expect(
        resolveFieldMetadataStandardOverride(
          fieldMetadata,
          'label',
          SOURCE_LOCALE,
          mockI18n,
        ),
      ).toBe('Overridden Label');
      expect(
        resolveFieldMetadataStandardOverride(
          fieldMetadata,
          'description',
          SOURCE_LOCALE,
          mockI18n,
        ),
      ).toBe('Overridden Description');
      expect(
        resolveFieldMetadataStandardOverride(
          fieldMetadata,
          'icon',
          SOURCE_LOCALE,
          mockI18n,
        ),
      ).toBe('overridden-icon');
    });

    it('should not use direct override for non-SOURCE_LOCALE', () => {
      const fieldMetadata = baseFixture({
        standardOverrides: { label: 'Overridden Label' },
      });

      const result = resolveFieldMetadataStandardOverride(
        fieldMetadata,
        'label',
        'fr-FR',
        mockI18n,
      );

      expect(result).toBe('Standard Label');
    });

    it('should not use empty string override for SOURCE_LOCALE', () => {
      const fieldMetadata = baseFixture({
        standardOverrides: { label: '' },
      });

      const result = resolveFieldMetadataStandardOverride(
        fieldMetadata,
        'label',
        SOURCE_LOCALE,
        mockI18n,
      );

      expect(result).toBe('Standard Label');
    });

    it('should not use undefined override for SOURCE_LOCALE', () => {
      const fieldMetadata = baseFixture({
        standardOverrides: { label: undefined },
      });

      const result = resolveFieldMetadataStandardOverride(
        fieldMetadata,
        'label',
        SOURCE_LOCALE,
        mockI18n,
      );

      expect(result).toBe('Standard Label');
    });
  });

  describe('Standard fields - Registry-based translation', () => {
    it('should return translated label when the registry has the descriptor', () => {
      mockTranslateStandardMetadataLabel.mockReturnValue(
        'Libellé traduit automatiquement',
      );

      const result = resolveFieldMetadataStandardOverride(
        baseFixture(),
        'label',
        'fr-FR',
        mockI18n,
      );

      expect(mockTranslateStandardMetadataLabel).toHaveBeenCalledWith(
        mockI18n,
        'Standard Label',
      );
      expect(result).toBe('Libellé traduit automatiquement');
    });

    it('should return original field value when registry has no descriptor', () => {
      mockTranslateStandardMetadataLabel.mockReturnValue(undefined);

      const result = resolveFieldMetadataStandardOverride(
        baseFixture(),
        'label',
        'fr-FR',
        mockI18n,
      );

      expect(result).toBe('Standard Label');
    });
  });

  describe('Priority order - Standard fields', () => {
    it('should prioritize translation override over SOURCE_LOCALE override for non-SOURCE_LOCALE', () => {
      const fieldMetadata = baseFixture({
        standardOverrides: {
          label: 'Source Override',
          translations: {
            'fr-FR': { label: 'Translation Override' },
          },
        },
      });

      const result = resolveFieldMetadataStandardOverride(
        fieldMetadata,
        'label',
        'fr-FR',
        mockI18n,
      );

      expect(result).toBe('Translation Override');
      expect(mockTranslateStandardMetadataLabel).not.toHaveBeenCalled();
    });

    it('should prioritize SOURCE_LOCALE override over auto translation for SOURCE_LOCALE', () => {
      const fieldMetadata = baseFixture({
        standardOverrides: { label: 'Source Override' },
      });

      const result = resolveFieldMetadataStandardOverride(
        fieldMetadata,
        'label',
        SOURCE_LOCALE,
        mockI18n,
      );

      expect(result).toBe('Source Override');
      expect(mockTranslateStandardMetadataLabel).not.toHaveBeenCalled();
    });

    it('should use registry translation when no overrides are available', () => {
      mockTranslateStandardMetadataLabel.mockReturnValue('Auto Translated Label');

      const result = resolveFieldMetadataStandardOverride(
        baseFixture({ standardOverrides: {} }),
        'label',
        'de-DE',
        mockI18n,
      );

      expect(result).toBe('Auto Translated Label');
    });
  });
});
