import { type ReactNode, useState } from 'react';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { IconGripVertical } from 'twenty-ui/display';

import { ADD_TO_NAVIGATION_DRAG_TYPE } from '@/navigation-menu-item/constants/AddToNavigationDrag.constants';
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

const StyledIconSlot = styled.div<{
  $iconBackgroundColor?: string;
  $showDragHandle: boolean;
}>`
  align-items: center;
  background-color: ${({ theme, $iconBackgroundColor, $showDragHandle }) =>
    $showDragHandle
      ? theme.background.transparent.lighter
      : $iconBackgroundColor};
  border-radius: ${({ theme }) => theme.border.radius.xs};
  display: flex;
  flex-shrink: 0;
  height: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  margin-right: ${({ theme }) => theme.spacing(2)};
  width: ${({ theme }) => theme.spacing(4)};
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
      ADD_TO_NAVIGATION_DRAG_TYPE,
      JSON.stringify(payload),
    );
    event.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <StyledDraggableWrapper
      draggable
      onDragStart={handleDragStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <StyledIconSlot
        $iconBackgroundColor={iconBackgroundColor}
        $showDragHandle={isHovered}
      >
        {isHovered ? (
          <IconGripVertical
            size={theme.spacing(3)}
            stroke={theme.icon.stroke.md}
            color={theme.grayScale.gray50}
          />
        ) : (
          icon
        )}
      </StyledIconSlot>
      {children}
    </StyledDraggableWrapper>
  );
};
