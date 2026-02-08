import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import type { ReactNode } from 'react';
import { IconGripVertical, type IconComponent } from 'twenty-ui/display';

import { ADD_TO_NAVIGATION_DRAG } from '@/navigation-menu-item/constants/AddToNavigationDrag.constants';
import { AddToNavigationIconSlot } from '@/navigation-menu-item/components/AddToNavigationIconSlot';
import type { AddToNavigationDragPayload } from '@/navigation-menu-item/types/add-to-navigation-drag-payload';

const StyledIconSlot = styled.div<{ $isDraggable: boolean }>`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: ${({ $isDraggable }) => ($isDraggable ? 'grab' : 'default')};
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(1)};

  &:active {
    cursor: ${({ $isDraggable }) => ($isDraggable ? 'grabbing' : 'default')};
  }
`;

type AddToNavigationDragHandleProps = {
  icon?: IconComponent | ReactNode;
  payload: AddToNavigationDragPayload;
  isHovered: boolean;
  draggable?: boolean;
};

export const AddToNavigationDragHandle = ({
  icon,
  payload,
  isHovered,
  draggable: isDraggable = true,
}: AddToNavigationDragHandleProps) => {
  const theme = useTheme();
  const iconSize = theme.icon.size.md;
  const iconStroke = theme.icon.stroke.sm;

  const handleDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData(
      ADD_TO_NAVIGATION_DRAG.TYPE,
      JSON.stringify(payload),
    );
    event.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <StyledIconSlot
      draggable={isDraggable}
      onDragStart={isDraggable ? handleDragStart : undefined}
      $isDraggable={isDraggable}
    >
      {isHovered ? (
        <IconGripVertical
          size={iconSize}
          stroke={iconStroke}
          color={theme.font.color.tertiary}
        />
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
