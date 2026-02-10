import {
  computeInsertIndexAndPosition,
  normalizeUrl,
} from '@/navigation-menu-item/utils/add-to-navigation-draft.utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

describe('normalizeUrl', () => {
  it('should return url unchanged when it starts with http://', () => {
    expect(normalizeUrl('http://example.com')).toBe('http://example.com');
  });

  it('should return url unchanged when it starts with https://', () => {
    expect(normalizeUrl('https://example.com')).toBe('https://example.com');
  });

  it('should prepend https:// when url has no protocol', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com');
  });

  it('should trim whitespace and then prepend https:// when no protocol', () => {
    expect(normalizeUrl('  example.com  ')).toBe('https://example.com');
  });

  it('should not double-prepend https when trimmed value already has it', () => {
    expect(normalizeUrl('  https://example.com  ')).toBe('https://example.com');
  });
});

describe('computeInsertIndexAndPosition', () => {
  it('should return flatIndex and position for insert at start of empty folder', () => {
    const currentDraft: NavigationMenuItem[] = [];
    const result = computeInsertIndexAndPosition(currentDraft, null, 0);
    expect(result).toEqual({ flatIndex: 0, position: 0.5 });
  });

  it('should compute insert before first item in folder', () => {
    const currentDraft: NavigationMenuItem[] = [
      { id: '1', folderId: null, position: 10 } as NavigationMenuItem,
      { id: '2', folderId: null, position: 20 } as NavigationMenuItem,
    ];
    const result = computeInsertIndexAndPosition(currentDraft, null, 0);
    expect(result.flatIndex).toBe(0);
    expect(result.position).toBe(5);
  });

  it('should compute insert between two items in folder', () => {
    const currentDraft: NavigationMenuItem[] = [
      { id: '1', folderId: null, position: 10 } as NavigationMenuItem,
      { id: '2', folderId: null, position: 20 } as NavigationMenuItem,
    ];
    const result = computeInsertIndexAndPosition(currentDraft, null, 1);
    expect(result.flatIndex).toBe(1);
    expect(result.position).toBe(15);
  });

  it('should compute insert at end of folder', () => {
    const currentDraft: NavigationMenuItem[] = [
      { id: '1', folderId: null, position: 10 } as NavigationMenuItem,
      { id: '2', folderId: null, position: 20 } as NavigationMenuItem,
    ];
    const result = computeInsertIndexAndPosition(currentDraft, null, 2);
    expect(result.flatIndex).toBe(2);
    expect(result.position).toBe(20.5);
  });

  it('should only consider items in target folder', () => {
    const currentDraft: NavigationMenuItem[] = [
      { id: '1', folderId: 'folder-a', position: 10 } as NavigationMenuItem,
      { id: '2', folderId: 'folder-b', position: 20 } as NavigationMenuItem,
      { id: '3', folderId: 'folder-b', position: 30 } as NavigationMenuItem,
    ];
    const result = computeInsertIndexAndPosition(currentDraft, 'folder-b', 1);
    expect(result.flatIndex).toBe(2);
    expect(result.position).toBe(25);
  });

  it('should exclude items with userWorkspaceId', () => {
    const currentDraft: NavigationMenuItem[] = [
      { id: '1', folderId: null, position: 10 } as NavigationMenuItem,
      {
        id: '2',
        folderId: null,
        position: 20,
        userWorkspaceId: 'ws-1',
      } as NavigationMenuItem,
    ];
    const result = computeInsertIndexAndPosition(currentDraft, null, 1);
    expect(result.flatIndex).toBe(1);
    expect(result.position).toBe(10.5);
  });
});
