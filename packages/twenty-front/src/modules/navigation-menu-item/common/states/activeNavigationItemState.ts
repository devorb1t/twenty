import { type ActiveNavigationItem } from '@/navigation-menu-item/common/types/ActiveNavigationItem';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const activeNavigationItemState =
  createAtomState<ActiveNavigationItem | null>({
    key: 'activeNavigationItemState',
    defaultValue: null,
  });
