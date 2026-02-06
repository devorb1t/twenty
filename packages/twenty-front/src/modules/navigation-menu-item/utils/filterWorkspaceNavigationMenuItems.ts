import { isDefined } from 'twenty-shared/utils';

export const filterWorkspaceNavigationMenuItems = <
  T extends { userWorkspaceId?: string | null },
>(
  items: T[],
): T[] => items.filter((item) => !isDefined(item.userWorkspaceId));
