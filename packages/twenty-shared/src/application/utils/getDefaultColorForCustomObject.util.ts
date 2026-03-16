import {
  MAIN_COLOR_NAMES,
  type ThemeColorName,
} from '../../constants/MainColorNames';

export const getDefaultColorForCustomObject = (
  nameSingular: string,
): ThemeColorName => {
  const customObjectColors = MAIN_COLOR_NAMES.filter(
    (color): color is Exclude<ThemeColorName, 'gray'> => color !== 'gray',
  );
  let hash = 0;
  for (let index = 0; index < nameSingular.length; index += 1) {
    hash = (hash << 5) - hash + nameSingular.charCodeAt(index);
    hash |= 0;
  }
  const index = Math.abs(hash) % customObjectColors.length;
  return customObjectColors[index];
};
