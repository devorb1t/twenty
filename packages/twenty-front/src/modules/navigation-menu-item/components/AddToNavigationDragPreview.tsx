import styled from '@emotion/styled';
import type { ComponentType } from 'react';
import type { Theme } from '@emotion/react';
import { ThemeProvider } from '@emotion/react';
import { ThemeContextProvider } from 'twenty-ui/theme';

import { getNavigationMenuItemIconColors } from '@/navigation-menu-item/utils/getNavigationMenuItemIconColors';
import type { AddToNavigationDragPayload } from '@/navigation-menu-item/types/add-to-navigation-drag-payload';

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
  padding-bottom: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(1)};
  padding-right: ${({ theme }) => theme.spacing(1)};
  padding-top: ${({ theme }) => theme.spacing(1)};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  min-width: 200px;
`;

const StyledIcon = styled.div<{ $backgroundColor?: string }>`
  align-items: center;
  display: flex;
  flex-grow: 0;
  flex-shrink: 0;
  justify-content: center;
  margin-right: ${({ theme }) => theme.spacing(2)};

  ${({ theme, $backgroundColor }) =>
    $backgroundColor &&
    `
    background-color: ${$backgroundColor};
    border-radius: ${theme.border.radius.xs};
    height: ${theme.spacing(4)};
    width: ${theme.spacing(4)};
  `}
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

const getIconBackgroundColor = (
  payload: AddToNavigationDragPayload,
  theme: Theme,
): string | undefined => {
  const iconColors = getNavigationMenuItemIconColors(theme);
  switch (payload.type) {
    case 'object':
      return iconColors.object;
    case 'view':
      return iconColors.view;
    case 'folder':
      return iconColors.folder;
    case 'link':
      return iconColors.link;
    case 'record':
      return undefined;
    default:
      return undefined;
  }
};

export type AddToNavigationDragPreviewProps = {
  label: string;
  Icon?: ComponentType<{ size?: number; stroke?: number; color?: string }>;
  icon?: React.ReactNode;
  payload: AddToNavigationDragPayload;
  theme: Theme;
};

export const AddToNavigationDragPreview = ({
  label,
  Icon,
  icon,
  payload,
  theme,
}: AddToNavigationDragPreviewProps) => {
  const iconBackgroundColor = getIconBackgroundColor(payload, theme);

  const iconContent =
    icon !== undefined ? (
      icon
    ) : Icon != null ? (
      <Icon
        size={iconBackgroundColor ? theme.spacing(3) : theme.icon.size.md}
        stroke={theme.icon.stroke.md}
        color={iconBackgroundColor ? theme.grayScale.gray1 : 'currentColor'}
      />
    ) : null;

  return (
    <ThemeProvider theme={theme}>
      <ThemeContextProvider theme={theme}>
        <StyledPreviewContainer>
          <StyledIcon $backgroundColor={iconBackgroundColor}>
            {iconContent}
          </StyledIcon>
          <StyledLabelParent>
            <StyledItemLabel>{label}</StyledItemLabel>
          </StyledLabelParent>
        </StyledPreviewContainer>
      </ThemeContextProvider>
    </ThemeProvider>
  );
};
