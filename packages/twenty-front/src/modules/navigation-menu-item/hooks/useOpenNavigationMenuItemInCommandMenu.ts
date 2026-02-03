import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import type { IconComponent } from 'twenty-ui/display';

export const useOpenNavigationMenuItemInCommandMenu = () => {
  const { navigateCommandMenu } = useNavigateCommandMenu();

  const openNavigationMenuItemInCommandMenu = ({
    pageTitle,
    pageIcon,
  }: {
    pageTitle: string;
    pageIcon: IconComponent;
  }) => {
    navigateCommandMenu({
      page: CommandMenuPages.NavigationMenuItemEdit,
      pageTitle,
      pageIcon,
      resetNavigationStack: true,
    });
  };

  return {
    openNavigationMenuItemInCommandMenu,
  };
};
