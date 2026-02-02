import { useCallback } from 'react';

import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useIcons } from 'twenty-ui/display';

export const useOpenNavigationMenuItemInCommandMenu = () => {
  const { navigateCommandMenu } = useNavigateCommandMenu();
  const { getIcon } = useIcons();

  const openNavigationMenuItemInCommandMenu = useCallback(
    ({ objectMetadataItem }: { objectMetadataItem: ObjectMetadataItem }) => {
      const Icon = getIcon(objectMetadataItem.icon);

      navigateCommandMenu({
        page: CommandMenuPages.NavigationMenuItemEdit,
        pageTitle: objectMetadataItem.labelPlural,
        pageIcon: Icon,
        resetNavigationStack: true,
      });
    },
    [getIcon, navigateCommandMenu],
  );

  return {
    openNavigationMenuItemInCommandMenu,
  };
};
