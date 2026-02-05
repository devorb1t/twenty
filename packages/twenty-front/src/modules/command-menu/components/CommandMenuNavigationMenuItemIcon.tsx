import styled from '@emotion/styled';

import { getNavigationMenuItemIconColors } from '@/navigation-menu-item/utils/getNavigationMenuItemIconColors';

const StyledIcon = styled.div<{ $colorKey: 'folder' | 'link' }>`
  align-items: center;
  background-color: ${({ theme, $colorKey }) =>
    getNavigationMenuItemIconColors(theme)[$colorKey]};
  border-radius: ${({ theme }) => theme.border.radius.xs};
  display: flex;
  height: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  width: ${({ theme }) => theme.spacing(4)};
`;

type CommandMenuNavigationMenuItemIconProps = {
  colorKey: 'folder' | 'link';
  children: React.ReactNode;
};

export const CommandMenuNavigationMenuItemIcon = ({
  colorKey,
  children,
}: CommandMenuNavigationMenuItemIconProps) => (
  <StyledIcon $colorKey={colorKey}>{children}</StyledIcon>
);
