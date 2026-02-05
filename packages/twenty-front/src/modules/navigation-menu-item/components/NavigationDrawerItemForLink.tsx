import { getNavigationMenuItemIconColors } from '@/navigation-menu-item/utils/getNavigationMenuItemIconColors';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useTheme } from '@emotion/react';
import { IconLink } from 'twenty-ui/display';

export type NavigationDrawerItemForLinkProps = {
  navigationMenuItem: ProcessedNavigationMenuItem;
  isEditMode?: boolean;
  isSelectedInEditMode?: boolean;
  onEditModeClick?: () => void;
};

export const NavigationDrawerItemForLink = ({
  navigationMenuItem,
  isEditMode = false,
  isSelectedInEditMode = false,
  onEditModeClick,
}: NavigationDrawerItemForLinkProps) => {
  const theme = useTheme();
  const iconColors = getNavigationMenuItemIconColors(theme);

  return (
    <NavigationDrawerItem
      label={navigationMenuItem.labelIdentifier}
      to={navigationMenuItem.link}
      onClick={isEditMode ? onEditModeClick : undefined}
      Icon={IconLink}
      iconBackgroundColor={iconColors.link}
      active={false}
      isSelectedInEditMode={isSelectedInEditMode}
    />
  );
};
