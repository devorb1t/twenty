import { type Theme } from '@emotion/react';
import { getIconBackgroundColorForPayload } from '@/navigation-menu-item/utils/getIconBackgroundColorForPayload';

describe('getIconBackgroundColorForPayload', () => {
  const mockTheme: Theme = {
    color: {
      orange: '#ff9500',
      red: '#ff3b30',
      blue: '#007aff',
    },
    grayScale: {
      gray8: '#b3b3b3',
    },
  } as unknown as Theme;

  it('should return object color for object payload', () => {
    const result = getIconBackgroundColorForPayload(
      { type: 'object', objectMetadataId: 'id', defaultViewId: 'v1', label: 'Obj' },
      mockTheme,
    );
    expect(result).toBe(mockTheme.color.blue);
  });

  it('should return view color for view payload', () => {
    const result = getIconBackgroundColorForPayload(
      { type: 'view', viewId: 'v1', label: 'View' },
      mockTheme,
    );
    expect(result).toBe(mockTheme.grayScale.gray8);
  });

  it('should return folder color for folder payload', () => {
    const result = getIconBackgroundColorForPayload(
      { type: 'folder', folderId: 'f1', name: 'Folder' },
      mockTheme,
    );
    expect(result).toBe(mockTheme.color.orange);
  });

  it('should return link color for link payload', () => {
    const result = getIconBackgroundColorForPayload(
      { type: 'link', linkId: 'l1', name: 'Link', link: 'https://example.com' },
      mockTheme,
    );
    expect(result).toBe(mockTheme.color.red);
  });

  it('should return undefined for record payload', () => {
    const result = getIconBackgroundColorForPayload(
      {
        type: 'record',
        recordId: 'r1',
        objectMetadataId: 'id',
        objectNameSingular: 'company',
        label: 'Record',
      },
      mockTheme,
    );
    expect(result).toBeUndefined();
  });
});
