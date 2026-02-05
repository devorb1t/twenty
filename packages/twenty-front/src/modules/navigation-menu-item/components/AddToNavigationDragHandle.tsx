import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useCallback, type ReactNode } from 'react';
import { IconGripVertical, type IconComponent } from 'twenty-ui/display';

import { ADD_TO_NAVIGATION_DRAG_TYPE } from '@/navigation-menu-item/constants/add-to-navigation-drag.constants';
import { type AddToNavigationDragPayload } from '@/navigation-menu-item/types/add-to-navigation-drag-payload';

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
  Icon?: IconComponent;
  icon?: ReactNode;
  payload: AddToNavigationDragPayload;
  isHovered: boolean;
  draggable?: boolean;
};

export const AddToNavigationDragHandle = ({
  Icon,
  icon,
  payload,
  isHovered,
  draggable: isDraggable = true,
}: AddToNavigationDragHandleProps) => {
  const theme = useTheme();

  const handleDragStart = useCallback(
    (event: React.DragEvent) => {
      event.dataTransfer.setData(
        ADD_TO_NAVIGATION_DRAG_TYPE,
        JSON.stringify(payload),
      );
      event.dataTransfer.effectAllowed = 'copy';
    },
    [payload],
  );

  return (
    <StyledIconSlot
      draggable={isDraggable}
      onDragStart={isDraggable ? handleDragStart : undefined}
      $isDraggable={isDraggable}
    >
      {isHovered ? (
        <IconGripVertical
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
          color={theme.font.color.tertiary}
        />
      ) : icon !== undefined ? (
        icon
      ) : (
        Icon != null && (
          <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        )
      )}
    </StyledIconSlot>
  );
};
