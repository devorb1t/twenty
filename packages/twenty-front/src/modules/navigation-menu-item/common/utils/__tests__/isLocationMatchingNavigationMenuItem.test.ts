import { NavigationMenuItemType } from 'twenty-shared/types';
import { isLocationMatchingNavigationMenuItem } from '@/navigation-menu-item/common/utils/isLocationMatchingNavigationMenuItem';

describe('isLocationMatchingNavigationMenuItem', () => {
  it('should return true when item link matches current path (non-view) or current view path (view)', () => {
    expect(
      isLocationMatchingNavigationMenuItem(
        '/app/objects/people',
        '/app/objects/people?viewId=123',
        NavigationMenuItemType.RECORD,
        '/app/objects/people',
      ),
    ).toBe(true);
    expect(
      isLocationMatchingNavigationMenuItem(
        '/app/objects/companies',
        '/app/objects/companies?viewId=123',
        NavigationMenuItemType.VIEW,
        '/app/objects/companies?viewId=123',
      ),
    ).toBe(true);
  });

  it('should return false when item link does not match path', () => {
    expect(
      isLocationMatchingNavigationMenuItem(
        '/app/objects/people',
        '/app/objects/people?viewId=123',
        NavigationMenuItemType.RECORD,
        '/app/objects/company',
      ),
    ).toBe(false);
    expect(
      isLocationMatchingNavigationMenuItem(
        '/app/objects/companies',
        '/app/objects/companies?viewId=123',
        NavigationMenuItemType.VIEW,
        '/app/objects/companies?viewId=456',
      ),
    ).toBe(false);
  });

  it('should match object or view nav item when on a record show page for that object', () => {
    expect(
      isLocationMatchingNavigationMenuItem(
        '/object/company/rec-1',
        '/object/company/rec-1',
        NavigationMenuItemType.OBJECT,
        '/objects/companies?viewId=idx',
        'company',
      ),
    ).toBe(true);

    expect(
      isLocationMatchingNavigationMenuItem(
        '/object/person/rec-1',
        '/object/person/rec-1',
        NavigationMenuItemType.VIEW,
        '/objects/people?viewId=v1',
        'person',
      ),
    ).toBe(true);

    expect(
      isLocationMatchingNavigationMenuItem(
        '/object/person/rec-1',
        '/object/person/rec-1',
        NavigationMenuItemType.OBJECT,
        '/objects/companies?viewId=idx',
        'company',
      ),
    ).toBe(false);
  });
});
