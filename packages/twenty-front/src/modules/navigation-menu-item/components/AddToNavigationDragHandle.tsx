import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import type { ReactNode } from 'react';
import { IconGripVertical, type IconComponent } from 'twenty-ui/display';

import { AddToNavigationIconSlot } from '@/navigation-menu-item/components/AddToNavigationIconSlot';
import type { AddToNavigationDragPayload } from '@/navigation-menu-item/types/add-to-navigation-drag-payload';
import { getIconBackgroundColorForPayload } from '@/navigation-menu-item/utils/getIconBackgroundColorForPayload';
import { StyledNavigationMenuItemIconContainer } from '@/navigation-menu-item/components/NavigationMenuItemIconContainer';

const StyledIconSlot = styled.div<{ $hasFixedSize: boolean }>`
  align-items: center;
  cursor: grab;
  display: flex;
  flex-shrink: 0;
  justify-content: center;

  ${({ theme, $hasFixedSize }) =>
    $hasFixedSize &&
    css`
      height: ${theme.spacing(4.5)};
      width: ${theme.spacing(4.5)};
    `}

  &:active {
    cursor: grabbing;
  }
`;

type AddToNavigationDragHandleProps = {
  icon?: IconComponent | ReactNode;
  payload: AddToNavigationDragPayload;
  isHovered: boolean;
};

export const AddToNavigationDragHandle = ({
  icon,
  payload,
  isHovered,
}: AddToNavigationDragHandleProps) => {
  const theme = useTheme();
  const iconBackgroundColor = getIconBackgroundColorForPayload(payload, theme);
  const hasBackgroundColor = !!iconBackgroundColor && !isHovered;
  const payloadHasBackgroundColor = !!iconBackgroundColor;
  const iconSize = theme.icon.size.md;
  const iconStroke = theme.icon.stroke.sm;

  return (
    <StyledIconSlot $hasFixedSize={payloadHasBackgroundColor}>
      {isHovered ? (
        <IconGripVertical
          size={iconSize}
          stroke={iconStroke}
          color={theme.font.color.tertiary}
        />
      ) : hasBackgroundColor ? (
        <StyledNavigationMenuItemIconContainer
          $backgroundColor={iconBackgroundColor}
        >
          <AddToNavigationIconSlot
            icon={icon}
            size={iconSize}
            stroke={iconStroke}
            color={theme.grayScale.gray1}
          />
        </StyledNavigationMenuItemIconContainer>
      ) : (
        <AddToNavigationIconSlot
          icon={icon}
          size={iconSize}
          stroke={iconStroke}
        />
      )}
    </StyledIconSlot>
  );
};
