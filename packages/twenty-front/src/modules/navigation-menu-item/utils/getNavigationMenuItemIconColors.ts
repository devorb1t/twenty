import type { Theme } from '@emotion/react';

export const getNavigationMenuItemIconColors = (theme: Theme) => ({
  folder: theme.color.orange,
  view: theme.grayScale.gray8,
  object: theme.color.blue,
});
