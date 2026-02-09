import { type Theme, ThemeProvider } from '@emotion/react';
import styled from '@emotion/styled';
import type { IconComponent } from 'twenty-ui/display';
import { ThemeContextProvider } from 'twenty-ui/theme';

import { AddToNavigationIconSlot } from '@/navigation-menu-item/components/AddToNavigationIconSlot';
import { StyledNavigationMenuItemIconContainer } from '@/navigation-menu-item/components/NavigationMenuItemIconContainer';
import type { AddToNavigationDragPayload } from '@/navigation-menu-item/types/add-to-navigation-drag-payload';
import { getIconBackgroundColorForPayload } from '@/navigation-menu-item/utils/getIconBackgroundColorForPayload';

const StyledPreviewContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-sizing: border-box;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.md};
  height: ${({ theme }) => theme.spacing(7)};
  padding: ${({ theme }) => theme.spacing(1)};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  min-width: 200px;
`;

const StyledIconWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-grow: 0;
  flex-shrink: 0;
  justify-content: center;
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

const StyledLabelParent = styled.div`
  display: flex;
  align-items: center;
  flex: 1 1 auto;
  white-space: nowrap;
  min-width: 0;
  overflow: hidden;
  text-overflow: clip;
`;

const StyledItemLabel = styled.span`
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

export type AddToNavigationDragPreviewProps = {
  label: string;
  icon?: IconComponent | React.ReactNode;
  payload: AddToNavigationDragPayload;
  theme: Theme;
};

export const AddToNavigationDragPreview = ({
  label,
  icon,
  payload,
  theme,
}: AddToNavigationDragPreviewProps) => {
  const iconBackgroundColor = getIconBackgroundColorForPayload(payload, theme);
  const iconSize = iconBackgroundColor
    ? theme.spacing(3.5)
    : theme.icon.size.md;
  const iconStroke = theme.icon.stroke.md;
  const iconColor = iconBackgroundColor
    ? theme.grayScale.gray1
    : 'currentColor';

  const iconSlot = (
    <AddToNavigationIconSlot
      icon={icon}
      size={iconSize}
      stroke={iconStroke}
      color={iconColor}
    />
  );

  return (
    <ThemeProvider theme={theme}>
      <ThemeContextProvider theme={theme}>
        <StyledPreviewContainer>
          <StyledIconWrapper>
            {iconBackgroundColor ? (
              <StyledNavigationMenuItemIconContainer
                $backgroundColor={iconBackgroundColor}
              >
                {iconSlot}
              </StyledNavigationMenuItemIconContainer>
            ) : (
              iconSlot
            )}
          </StyledIconWrapper>
          <StyledLabelParent>
            <StyledItemLabel>{label}</StyledItemLabel>
          </StyledLabelParent>
        </StyledPreviewContainer>
      </ThemeContextProvider>
    </ThemeProvider>
  );
};
