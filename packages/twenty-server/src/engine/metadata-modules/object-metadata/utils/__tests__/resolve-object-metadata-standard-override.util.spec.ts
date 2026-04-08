import { type I18n } from '@lingui/core';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { translateStandardMetadataLabel } from 'src/engine/core-modules/i18n/standard-metadata-descriptor-registry/translate-standard-metadata-label.util';
import { type ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import { resolveObjectMetadataStandardOverride } from 'src/engine/metadata-modules/object-metadata/utils/resolve-object-metadata-standard-override.util';

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

type ObjectFixture = Pick<
  ObjectMetadataDTO,
  | 'color'
  | 'labelPlural'
  | 'labelSingular'
  | 'description'
  | 'icon'
  | 'isCustom'
  | 'standardOverrides'
>;

const baseFixture = (
  overrides: Partial<ObjectFixture> = {},
): ObjectFixture => ({
  labelSingular: 'Standard Label',
  labelPlural: 'Standard Labels',
  description: 'Standard Description',
  icon: 'default-icon',
  color: 'blue',
  isCustom: false,
  standardOverrides: undefined,
  ...overrides,
});

describe('resolveObjectMetadataStandardOverride', () => {
  let mockI18n: jest.Mocked<I18n>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockI18n = {
      _: jest.fn(),
    } as unknown as jest.Mocked<I18n>;
    mockTranslateStandardMetadataLabel.mockReturnValue(undefined);
  });

  describe('Custom objects', () => {
    it('should return the object value for custom labelSingular object', () => {
      const objectMetadata = baseFixture({
        labelSingular: 'My Custom',
        isCustom: true,
      });

      const result = resolveObjectMetadataStandardOverride(
        objectMetadata,
        'labelSingular',
        'fr-FR',
        mockI18n,
      );

      expect(result).toBe('My Custom');
    });

    it('should return the object value for custom description object', () => {
      const objectMetadata = baseFixture({
        description: 'Custom Description',
        isCustom: true,
      });

      const result = resolveObjectMetadataStandardOverride(
        objectMetadata,
        'description',
        undefined,
        mockI18n,
      );

      expect(result).toBe('Custom Description');
    });

    it('should return the object value for custom icon object', () => {
      const objectMetadata = baseFixture({
        icon: 'custom-icon',
        isCustom: true,
      });

      const result = resolveObjectMetadataStandardOverride(
        objectMetadata,
        'icon',
        SOURCE_LOCALE,
        mockI18n,
      );

      expect(result).toBe('custom-icon');
    });

    it('should return the object value for custom color object', () => {
      const objectMetadata = baseFixture({
        color: 'green',
        isCustom: true,
      });

      const result = resolveObjectMetadataStandardOverride(
        objectMetadata,
        'color',
        SOURCE_LOCALE,
        mockI18n,
      );

      expect(result).toBe('green');
    });
  });

  describe('Standard objects - Icon overrides', () => {
    it('should return override icon when available for standard object', () => {
      const objectMetadata = baseFixture({
        standardOverrides: { icon: 'override-icon' },
      });

      const result = resolveObjectMetadataStandardOverride(
        objectMetadata,
        'icon',
        'fr-FR',
        mockI18n,
      );

      expect(result).toBe('override-icon');
    });
  });

  describe('Standard objects - Color overrides', () => {
    it('should return override color when available for standard object', () => {
      const objectMetadata = baseFixture({
        standardOverrides: { color: 'red' },
      });

      const result = resolveObjectMetadataStandardOverride(
        objectMetadata,
        'color',
        'fr-FR',
        mockI18n,
      );

      expect(result).toBe('red');
    });

    it('should return base color when no override exists for standard object', () => {
      const objectMetadata = baseFixture();

      const result = resolveObjectMetadataStandardOverride(
        objectMetadata,
        'color',
        SOURCE_LOCALE,
        mockI18n,
      );

      expect(result).toBe('blue');
    });
  });

  describe('Standard objects - Translation overrides', () => {
    it('should return translation override when available for non-icon objects', () => {
      const objectMetadata = baseFixture({
        standardOverrides: {
          translations: {
            'fr-FR': {
              labelSingular: 'Libellé traduit',
              labelPlural: 'Libellés traduits',
              description: 'Description traduite',
            },
          },
        },
      });

      expect(
        resolveObjectMetadataStandardOverride(
          objectMetadata,
          'labelSingular',
          'fr-FR',
          mockI18n,
        ),
      ).toBe('Libellé traduit');
      expect(
        resolveObjectMetadataStandardOverride(
          objectMetadata,
          'labelPlural',
          'fr-FR',
          mockI18n,
        ),
      ).toBe('Libellés traduits');
      expect(
        resolveObjectMetadataStandardOverride(
          objectMetadata,
          'description',
          'fr-FR',
          mockI18n,
        ),
      ).toBe('Description traduite');
    });

    it('should fallback when translation override is not available for the locale', () => {
      const objectMetadata = baseFixture({
        standardOverrides: {
          translations: {
            'es-ES': {
              labelSingular: 'Etiqueta en español',
              labelPlural: 'Etiquetas en español',
              description: 'Descripción en español',
            },
          },
        },
      });

      const result = resolveObjectMetadataStandardOverride(
        objectMetadata,
        'labelSingular',
        'fr-FR',
        mockI18n,
      );

      expect(result).toBe('Standard Label');
    });

    it('should fallback when translation override is not available for the labelKey', () => {
      const objectMetadata = baseFixture({
        standardOverrides: {
          translations: {
            'fr-FR': {
              labelPlural: 'Libellés traduits',
              labelSingular: 'Libellé traduit',
            },
          },
        },
      });

      const result = resolveObjectMetadataStandardOverride(
        objectMetadata,
        'description',
        'fr-FR',
        mockI18n,
      );

      expect(result).toBe('Standard Description');
    });

    it('should not use translation overrides when locale is undefined', () => {
      const objectMetadata = baseFixture({
        standardOverrides: {
          translations: {
            'fr-FR': {
              labelSingular: 'Libellé traduit',
              labelPlural: 'Libellés traduits',
              description: 'Description traduite',
            },
          },
        },
      });

      const result = resolveObjectMetadataStandardOverride(
        objectMetadata,
        'labelSingular',
        undefined,
        mockI18n,
      );

      expect(result).toBe('Standard Label');
    });
  });

  describe('Standard objects - SOURCE_LOCALE overrides', () => {
    it('should return direct override for SOURCE_LOCALE when available', () => {
      const objectMetadata = baseFixture({
        standardOverrides: {
          labelSingular: 'Overridden Label',
          labelPlural: 'Overridden Labels',
          description: 'Overridden Description',
          icon: 'overridden-icon',
        },
      });

      expect(
        resolveObjectMetadataStandardOverride(
          objectMetadata,
          'labelSingular',
          SOURCE_LOCALE,
          mockI18n,
        ),
      ).toBe('Overridden Label');
      expect(
        resolveObjectMetadataStandardOverride(
          objectMetadata,
          'labelPlural',
          SOURCE_LOCALE,
          mockI18n,
        ),
      ).toBe('Overridden Labels');
      expect(
        resolveObjectMetadataStandardOverride(
          objectMetadata,
          'description',
          SOURCE_LOCALE,
          mockI18n,
        ),
      ).toBe('Overridden Description');
      expect(
        resolveObjectMetadataStandardOverride(
          objectMetadata,
          'icon',
          SOURCE_LOCALE,
          mockI18n,
        ),
      ).toBe('overridden-icon');
    });

    it('should use direct override for non-SOURCE_LOCALE', () => {
      const objectMetadata = baseFixture({
        standardOverrides: {
          labelSingular: 'Overridden Label',
          labelPlural: 'Overridden Labels',
        },
      });

      const result = resolveObjectMetadataStandardOverride(
        objectMetadata,
        'labelSingular',
        'fr-FR',
        mockI18n,
      );

      expect(result).toBe('Overridden Label');
    });

    it('should not use undefined override for SOURCE_LOCALE', () => {
      const objectMetadata = baseFixture({
        standardOverrides: { labelSingular: undefined },
      });

      const result = resolveObjectMetadataStandardOverride(
        objectMetadata,
        'labelSingular',
        SOURCE_LOCALE,
        mockI18n,
      );

      expect(result).toBe('Standard Label');
    });
  });

  describe('Standard objects - Registry-based translation', () => {
    it('should return translated label when the registry has the descriptor', () => {
      mockTranslateStandardMetadataLabel.mockReturnValue(
        'Libellé traduit automatiquement',
      );

      const result = resolveObjectMetadataStandardOverride(
        baseFixture(),
        'labelSingular',
        'fr-FR',
        mockI18n,
      );

      expect(mockTranslateStandardMetadataLabel).toHaveBeenCalledWith(
        mockI18n,
        'Standard Label',
      );
      expect(result).toBe('Libellé traduit automatiquement');
    });

    it('should fall back to original label when registry has no descriptor', () => {
      mockTranslateStandardMetadataLabel.mockReturnValue(undefined);

      const result = resolveObjectMetadataStandardOverride(
        baseFixture(),
        'labelSingular',
        'fr-FR',
        mockI18n,
      );

      expect(result).toBe('Standard Label');
    });
  });

  describe('Priority order - Standard objects', () => {
    it('should prioritize translation override over SOURCE_LOCALE override for non-SOURCE_LOCALE', () => {
      const objectMetadata = baseFixture({
        standardOverrides: {
          labelSingular: 'Source Override',
          labelPlural: 'Source Overrides',
          translations: {
            'fr-FR': {
              labelSingular: 'Translation Override',
              labelPlural: 'Translation Overrides',
            },
          },
        },
      });

      const result = resolveObjectMetadataStandardOverride(
        objectMetadata,
        'labelSingular',
        'fr-FR',
        mockI18n,
      );

      expect(result).toBe('Translation Override');
      expect(mockTranslateStandardMetadataLabel).not.toHaveBeenCalled();
    });

    it('should prioritize SOURCE_LOCALE override over auto translation for SOURCE_LOCALE', () => {
      const objectMetadata = baseFixture({
        standardOverrides: {
          labelSingular: 'Source Override',
          labelPlural: 'Source Overrides',
        },
      });

      const result = resolveObjectMetadataStandardOverride(
        objectMetadata,
        'labelSingular',
        SOURCE_LOCALE,
        mockI18n,
      );

      expect(result).toBe('Source Override');
      expect(mockTranslateStandardMetadataLabel).not.toHaveBeenCalled();
    });

    it('should use registry translation when no overrides are available', () => {
      mockTranslateStandardMetadataLabel.mockReturnValue('Auto Translated Label');

      const result = resolveObjectMetadataStandardOverride(
        baseFixture({ standardOverrides: {} }),
        'labelSingular',
        'de-DE',
        mockI18n,
      );

      expect(result).toBe('Auto Translated Label');
    });
  });

  describe('Undefined locale handling', () => {
    it('should use SOURCE_LOCALE fallback when locale is undefined for standard object', () => {
      const objectMetadata = baseFixture({
        standardOverrides: { labelSingular: 'Source Override' },
      });

      const result = resolveObjectMetadataStandardOverride(
        objectMetadata,
        'labelSingular',
        undefined,
        mockI18n,
      );

      expect(result).toBe('Source Override');
      expect(mockTranslateStandardMetadataLabel).not.toHaveBeenCalled();
    });

    it('should fall back to registry translation when locale is undefined and no SOURCE_LOCALE override exists', () => {
      mockTranslateStandardMetadataLabel.mockReturnValue('Auto Translated Label');

      const result = resolveObjectMetadataStandardOverride(
        baseFixture(),
        'labelSingular',
        undefined,
        mockI18n,
      );

      expect(result).toBe('Auto Translated Label');
    });
  });
});
