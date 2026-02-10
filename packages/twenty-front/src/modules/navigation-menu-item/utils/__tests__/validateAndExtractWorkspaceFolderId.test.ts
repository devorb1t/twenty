import {
  matchesWorkspaceFolderId,
  validateAndExtractWorkspaceFolderId,
} from '@/navigation-menu-item/utils/validateAndExtractWorkspaceFolderId';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

describe('matchesWorkspaceFolderId', () => {
  it('should return true when folderId is null and item has no folderId', () => {
    const item = { folderId: null } as NavigationMenuItem;
    expect(matchesWorkspaceFolderId(item, null)).toBe(true);
  });

  it('should return true when folderId is null and item folderId is undefined', () => {
    const item = {} as NavigationMenuItem;
    expect(matchesWorkspaceFolderId(item, null)).toBe(true);
  });

  it('should return false when folderId is null but item has folderId', () => {
    const item = { folderId: 'folder-1' } as NavigationMenuItem;
    expect(matchesWorkspaceFolderId(item, null)).toBe(false);
  });

  it('should return true when folderId matches item folderId', () => {
    const item = { folderId: 'folder-1' } as NavigationMenuItem;
    expect(matchesWorkspaceFolderId(item, 'folder-1')).toBe(true);
  });

  it('should return false when folderId does not match item folderId', () => {
    const item = { folderId: 'folder-1' } as NavigationMenuItem;
    expect(matchesWorkspaceFolderId(item, 'folder-2')).toBe(false);
  });
});

describe('validateAndExtractWorkspaceFolderId', () => {
  it('should return null for workspace orphan navigation menu items droppable id', () => {
    const result = validateAndExtractWorkspaceFolderId(
      'workspace-orphan-navigation-menu-items',
    );
    expect(result).toBe(null);
  });

  it('should extract folder id from workspace folder header prefix', () => {
    const result = validateAndExtractWorkspaceFolderId(
      'workspace-folder-header-folder-123',
    );
    expect(result).toBe('folder-123');
  });

  it('should extract folder id from workspace folder prefix', () => {
    const result = validateAndExtractWorkspaceFolderId(
      'workspace-folder-folder-456',
    );
    expect(result).toBe('folder-456');
  });

  it('should throw when workspace folder header id has no folder id after prefix', () => {
    expect(() =>
      validateAndExtractWorkspaceFolderId('workspace-folder-header-'),
    ).toThrow('Invalid workspace folder header ID');
  });

  it('should throw when workspace folder id has no folder id after prefix', () => {
    expect(() =>
      validateAndExtractWorkspaceFolderId('workspace-folder-'),
    ).toThrow('Invalid workspace folder ID');
  });

  it('should throw for invalid workspace droppable id format', () => {
    expect(() =>
      validateAndExtractWorkspaceFolderId('invalid-droppable-id'),
    ).toThrow('Invalid workspace droppable ID format');
  });

  it('should throw for unknown droppable id prefix', () => {
    expect(() =>
      validateAndExtractWorkspaceFolderId('workspace-other-thing-123'),
    ).toThrow('Invalid workspace droppable ID format');
  });
});
