import { NAVIGATION_MENU_ITEM_DROPPABLE_IDS } from '@/navigation-menu-item/constants/NavigationMenuItemDroppableIds';
import { isWorkspaceDroppableId } from '@/navigation-menu-item/utils/isWorkspaceDroppableId';

describe('isWorkspaceDroppableId', () => {
  it('should return false when droppableId is null', () => {
    expect(isWorkspaceDroppableId(null)).toBe(false);
  });

  it('should return false when droppableId is undefined', () => {
    expect(isWorkspaceDroppableId(undefined)).toBe(false);
  });

  it('should return true for workspace orphan navigation menu items droppable id', () => {
    expect(
      isWorkspaceDroppableId(
        NAVIGATION_MENU_ITEM_DROPPABLE_IDS.WORKSPACE_ORPHAN_NAVIGATION_MENU_ITEMS,
      ),
    ).toBe(true);
  });

  it('should return true when droppableId starts with workspace folder prefix', () => {
    expect(
      isWorkspaceDroppableId('workspace-folder-folder-123'),
    ).toBe(true);
  });

  it('should return true when droppableId starts with workspace folder header prefix', () => {
    expect(
      isWorkspaceDroppableId('workspace-folder-header-folder-456'),
    ).toBe(true);
  });

  it('should return false for non-workspace droppable id', () => {
    expect(isWorkspaceDroppableId('favorites-orphan')).toBe(false);
    expect(isWorkspaceDroppableId('other-droppable-id')).toBe(false);
  });
});
