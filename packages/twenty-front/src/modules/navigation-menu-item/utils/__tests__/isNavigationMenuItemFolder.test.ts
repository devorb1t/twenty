import { isNavigationMenuItemFolder } from '@/navigation-menu-item/utils/isNavigationMenuItemFolder';

describe('isNavigationMenuItemFolder', () => {
  it('should return true when item has name and no link, viewId, targetRecordId, or targetObjectMetadataId', () => {
    expect(
      isNavigationMenuItemFolder({
        name: 'My Folder',
        link: null,
        folderId: 'folder-1',
        viewId: null,
        targetRecordId: null,
        targetObjectMetadataId: null,
      }),
    ).toBe(true);
  });

  it('should return false when item has link defined', () => {
    expect(
      isNavigationMenuItemFolder({
        name: 'My Folder',
        link: 'https://example.com',
        viewId: null,
        targetRecordId: null,
        targetObjectMetadataId: null,
      }),
    ).toBe(false);
  });

  it('should return false when item has viewId defined', () => {
    expect(
      isNavigationMenuItemFolder({
        name: 'My Folder',
        link: null,
        viewId: 'view-1',
        targetRecordId: null,
        targetObjectMetadataId: null,
      }),
    ).toBe(false);
  });

  it('should return false when item has targetRecordId defined', () => {
    expect(
      isNavigationMenuItemFolder({
        name: 'My Folder',
        link: null,
        viewId: null,
        targetRecordId: 'record-1',
        targetObjectMetadataId: null,
      }),
    ).toBe(false);
  });

  it('should return false when item has targetObjectMetadataId defined', () => {
    expect(
      isNavigationMenuItemFolder({
        name: 'My Folder',
        link: null,
        viewId: null,
        targetRecordId: null,
        targetObjectMetadataId: 'metadata-1',
      }),
    ).toBe(false);
  });

  it('should return false when name is undefined', () => {
    expect(
      isNavigationMenuItemFolder({
        name: undefined,
        link: null,
        viewId: null,
        targetRecordId: null,
        targetObjectMetadataId: null,
      }),
    ).toBe(false);
  });

  it('should return false when name is null', () => {
    expect(
      isNavigationMenuItemFolder({
        name: null,
        link: null,
        viewId: null,
        targetRecordId: null,
        targetObjectMetadataId: null,
      }),
    ).toBe(false);
  });
});
