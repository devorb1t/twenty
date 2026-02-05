import { useTheme } from '@emotion/react';

import { StyledNavigationMenuItemIconContainer } from '@/navigation-menu-item/components/NavigationMenuItemIconContainer';
import { getNavigationMenuItemIconColors } from '@/navigation-menu-item/utils/getNavigationMenuItemIconColors';

type CommandMenuNavigationMenuItemIconProps = {
  colorKey: 'folder' | 'link';
  children: React.ReactNode;
};

export const CommandMenuNavigationMenuItemIcon = ({
  colorKey,
  children,
}: CommandMenuNavigationMenuItemIconProps) => {
  const theme = useTheme();
  const backgroundColor = getNavigationMenuItemIconColors(theme)[colorKey];

  return (
    <StyledNavigationMenuItemIconContainer $backgroundColor={backgroundColor}>
      {children}
    </StyledNavigationMenuItemIconContainer>
  );
};
