import { type PageLayoutWidgetDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/page-layout-widget.dto';

export const sortWidgetDtosByPosition = (
  widgets: PageLayoutWidgetDTO[],
): PageLayoutWidgetDTO[] => {
  return [...widgets].sort((a, b) => {
    const posA = a.position;
    const posB = b.position;

    if (!posA || !posB) return 0;

    if ('index' in posA && 'index' in posB) {
      return posA.index - posB.index;
    }

    if ('row' in posA && 'row' in posB) {
      if (posA.row !== posB.row) return posA.row - posB.row;

      if ('column' in posA && 'column' in posB) {
        return posA.column - posB.column;
      }
    }

    return 0;
  });
};
