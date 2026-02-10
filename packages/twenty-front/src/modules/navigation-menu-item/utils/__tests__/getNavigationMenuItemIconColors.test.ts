import { type Theme } from '@emotion/react';
import { getNavigationMenuItemIconColors } from '@/navigation-menu-item/utils/getNavigationMenuItemIconColors';

describe('getNavigationMenuItemIconColors', () => {
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

  it('should return theme colors for folder, link, view and object', () => {
    const result = getNavigationMenuItemIconColors(mockTheme);

    expect(result.folder).toBe(mockTheme.color.orange);
    expect(result.link).toBe(mockTheme.color.red);
    expect(result.view).toBe(mockTheme.grayScale.gray8);
    expect(result.object).toBe(mockTheme.color.blue);
  });
});
