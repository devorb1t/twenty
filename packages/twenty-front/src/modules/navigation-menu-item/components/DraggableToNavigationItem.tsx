import { type ReactNode, useState } from 'react';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { IconGripVertical } from 'twenty-ui/display';

import { ADD_TO_NAVIGATION_DRAG } from '@/navigation-menu-item/constants/AddToNavigationDrag.constants';
import { StyledNavigationMenuItemIconContainer } from '@/navigation-menu-item/components/NavigationMenuItemIconContainer';
import { type AddToNavigationDragPayload } from '@/navigation-menu-item/types/add-to-navigation-drag-payload';

const StyledDraggableWrapper = styled.div`
  align-items: center;
  cursor: grab;
  display: flex;
  position: relative;

  &:active {
    cursor: grabbing;
  }
`;

const StyledIconSlot = styled.div`
  flex-shrink: 0;
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

type DraggableToNavigationItemProps = {
  payload: AddToNavigationDragPayload;
  icon: ReactNode;
  iconBackgroundColor?: string;
  children: ReactNode;
};

export const DraggableToNavigationItem = ({
  payload,
  icon,
  iconBackgroundColor,
  children,
}: DraggableToNavigationItemProps) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const handleDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData(
      ADD_TO_NAVIGATION_DRAG.TYPE,
      JSON.stringify(payload),
    );
    event.dataTransfer.effectAllowed = 'copy';
  };

  const iconSlotBackgroundColor = isHovered
    ? theme.background.transparent.lighter
    : iconBackgroundColor;

  return (
    <StyledDraggableWrapper
      draggable
      onDragStart={handleDragStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <StyledIconSlot>
        <StyledNavigationMenuItemIconContainer
          $backgroundColor={iconSlotBackgroundColor}
        >
          {isHovered ? (
            <IconGripVertical
              size={theme.spacing(3.5)}
              stroke={theme.icon.stroke.md}
              color={theme.font.color.tertiary}
            />
          ) : (
            icon
          )}
        </StyledNavigationMenuItemIconContainer>
      </StyledIconSlot>
      {children}
    </StyledDraggableWrapper>
  );
};
