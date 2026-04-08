import { type I18n } from '@lingui/core';

import { translateStandardMetadataLabel } from 'src/engine/core-modules/i18n/standard-metadata-descriptor-registry/translate-standard-metadata-label.util';
import { resolvePageLayoutTabTitle } from 'src/engine/metadata-modules/page-layout-tab/utils/resolve-page-layout-tab-title.util';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

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

describe('resolvePageLayoutTabTitle', () => {
  let mockI18n: jest.Mocked<I18n>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockI18n = {
      _: jest.fn(),
    } as unknown as jest.Mocked<I18n>;
    mockTranslateStandardMetadataLabel.mockReturnValue(undefined);
  });

  it('should return translated title when registry has the descriptor', () => {
    mockTranslateStandardMetadataLabel.mockReturnValue('Accueil');

    const result = resolvePageLayoutTabTitle({
      title: 'Home',
      applicationId: TWENTY_STANDARD_APPLICATION.universalIdentifier,
      i18nInstance: mockI18n,
    });

    expect(mockTranslateStandardMetadataLabel).toHaveBeenCalledWith(
      mockI18n,
      'Home',
    );
    expect(result).toBe('Accueil');
  });

  it('should return original title when no descriptor is registered for it', () => {
    mockTranslateStandardMetadataLabel.mockReturnValue(undefined);

    const result = resolvePageLayoutTabTitle({
      title: 'My Custom Tab',
      applicationId: TWENTY_STANDARD_APPLICATION.universalIdentifier,
      i18nInstance: mockI18n,
    });

    expect(result).toBe('My Custom Tab');
  });

  it('should return original title for empty string', () => {
    const result = resolvePageLayoutTabTitle({
      title: '',
      applicationId: TWENTY_STANDARD_APPLICATION.universalIdentifier,
      i18nInstance: mockI18n,
    });

    expect(result).toBe('');
  });

  it('should not translate title when applicationId is not from standard app', () => {
    const customAppId = '11111111-1111-1111-1111-111111111111';

    const result = resolvePageLayoutTabTitle({
      title: 'Home',
      applicationId: customAppId,
      i18nInstance: mockI18n,
    });

    expect(mockTranslateStandardMetadataLabel).not.toHaveBeenCalled();
    expect(result).toBe('Home');
  });
});
