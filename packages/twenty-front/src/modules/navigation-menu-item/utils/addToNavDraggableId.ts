import type { AddToNavigationDragPayload } from '@/navigation-menu-item/types/add-to-navigation-drag-payload';

const ADD_TO_NAV_PREFIX = 'add-to-nav:';

export const getAddToNavDraggableId = (
  payload: AddToNavigationDragPayload,
): string => `${ADD_TO_NAV_PREFIX}${JSON.stringify(payload)}`;

export const getAddToNavPayloadByDraggableId = (
  draggableId: string,
): AddToNavigationDragPayload | null => {
  if (!draggableId.startsWith(ADD_TO_NAV_PREFIX)) {
    return null;
  }
  try {
    return JSON.parse(
      draggableId.slice(ADD_TO_NAV_PREFIX.length),
    ) as AddToNavigationDragPayload;
  } catch {
    return null;
  }
};
