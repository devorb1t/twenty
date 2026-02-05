import type { WorkspaceSectionItem } from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';

export const getWorkspaceSectionItemId = (
  item: WorkspaceSectionItem,
): string =>
  item.type === 'folder' ? item.folder.folderId : item.navigationMenuItem.id;
