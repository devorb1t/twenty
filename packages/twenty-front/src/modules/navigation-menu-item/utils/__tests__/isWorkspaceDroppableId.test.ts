import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/constants/NavigationMenuItemDroppableIds';
import { isWorkspaceDroppableId } from '@/navigation-menu-item/utils/isWorkspaceDroppableId';

describe('isWorkspaceDroppableId', () => {
  it('should return false for null, undefined or non-workspace ids', () => {
    expect(isWorkspaceDroppableId(null)).toBe(false);
    expect(isWorkspaceDroppableId(undefined)).toBe(false);
    expect(isWorkspaceDroppableId('favorites-orphan')).toBe(false);
  });

  it('should return true for workspace orphan or folder droppable ids', () => {
    expect(
      isWorkspaceDroppableId(
        NavigationMenuItemDroppableIds.WORKSPACE_ORPHAN_NAVIGATION_MENU_ITEMS,
      ),
    ).toBe(true);
    expect(isWorkspaceDroppableId('workspace-folder-folder-123')).toBe(true);
    expect(
      isWorkspaceDroppableId('workspace-folder-header-folder-456'),
    ).toBe(true);
  });
});
