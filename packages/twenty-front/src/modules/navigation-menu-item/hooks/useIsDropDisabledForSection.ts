import { isWorkspaceDroppableId } from '@/navigation-menu-item/utils/isWorkspaceDroppableId';
import { NavigationDragSourceContext } from '@/navigation-menu-item/contexts/NavigationDragSourceContext';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useIsDropDisabledForSection = (isWorkspaceSection: boolean) => {
  const { sourceDroppableId } = useContext(NavigationDragSourceContext);
  return (
    isDefined(sourceDroppableId) &&
    isWorkspaceDroppableId(sourceDroppableId) !== isWorkspaceSection
  );
};
