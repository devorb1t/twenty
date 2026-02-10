import { isNavigationMenuItemLink } from '@/navigation-menu-item/utils/isNavigationMenuItemLink';

describe('isNavigationMenuItemLink', () => {
  it('should return true when item has non-empty link and no viewId, targetRecordId, or targetObjectMetadataId', () => {
    expect(
      isNavigationMenuItemLink({
        link: 'https://example.com',
        viewId: null,
        targetRecordId: null,
        targetObjectMetadataId: null,
      }),
    ).toBe(true);
  });

  it('should return false when link is empty string', () => {
    expect(
      isNavigationMenuItemLink({
        link: '',
        viewId: null,
        targetRecordId: null,
        targetObjectMetadataId: null,
      }),
    ).toBe(false);
  });

  it('should return false when link is only whitespace', () => {
    expect(
      isNavigationMenuItemLink({
        link: '   ',
        viewId: null,
        targetRecordId: null,
        targetObjectMetadataId: null,
      }),
    ).toBe(false);
  });

  it('should return false when viewId is defined', () => {
    expect(
      isNavigationMenuItemLink({
        link: 'https://example.com',
        viewId: 'view-1',
        targetRecordId: null,
        targetObjectMetadataId: null,
      }),
    ).toBe(false);
  });

  it('should return false when targetRecordId is defined', () => {
    expect(
      isNavigationMenuItemLink({
        link: 'https://example.com',
        viewId: null,
        targetRecordId: 'record-1',
        targetObjectMetadataId: null,
      }),
    ).toBe(false);
  });

  it('should return false when targetObjectMetadataId is defined', () => {
    expect(
      isNavigationMenuItemLink({
        link: 'https://example.com',
        viewId: null,
        targetRecordId: null,
        targetObjectMetadataId: 'metadata-1',
      }),
    ).toBe(false);
  });

  it('should return false when link is undefined', () => {
    expect(
      isNavigationMenuItemLink({
        link: undefined,
        viewId: null,
        targetRecordId: null,
        targetObjectMetadataId: null,
      }),
    ).toBe(false);
  });

  it('should return false when link is null', () => {
    expect(
      isNavigationMenuItemLink({
        link: null,
        viewId: null,
        targetRecordId: null,
        targetObjectMetadataId: null,
      }),
    ).toBe(false);
  });
});
