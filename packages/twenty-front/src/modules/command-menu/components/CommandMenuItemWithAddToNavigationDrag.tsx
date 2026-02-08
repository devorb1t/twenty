import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';
import { type IconComponent } from 'twenty-ui/display';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { AddToNavigationDragHandle } from '@/navigation-menu-item/components/AddToNavigationDragHandle';
import { ADD_TO_NAVIGATION_DRAG } from '@/navigation-menu-item/constants/AddToNavigationDrag.constants';
import type { AddToNavigationDragPayload } from '@/navigation-menu-item/types/add-to-navigation-drag-payload';
import { createAddToNavigationDragPreview } from '@/navigation-menu-item/utils/createAddToNavigationDragPreview';

const StyledDraggableMenuItem = styled.div`
  cursor: grab;
  width: 100%;

  &:active {
    cursor: grabbing;
  }
`;

type CommandMenuItemWithAddToNavigationDragProps = {
  icon?: IconComponent | React.ReactNode;
  label: string;
  description?: string;
  id: string;
  onClick: () => void;
  payload: AddToNavigationDragPayload;
};

export const CommandMenuItemWithAddToNavigationDrag = ({
  icon,
  label,
  description,
  id,
  onClick,
  payload,
}: CommandMenuItemWithAddToNavigationDragProps) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const handleDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData(
      ADD_TO_NAVIGATION_DRAG.TYPE,
      JSON.stringify(payload),
    );
    if (payload.type === 'folder') {
      event.dataTransfer.setData(ADD_TO_NAVIGATION_DRAG.FOLDER_TYPE, '');
    }
    event.dataTransfer.effectAllowed = 'copy';

    const preview = createAddToNavigationDragPreview({
      label,
      icon,
      payload,
      theme,
    });
    event.dataTransfer.setDragImage(preview, 0, 0);
  };

  return (
    <StyledDraggableMenuItem
      draggable
      onDragStart={handleDragStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CommandMenuItem
        label={label}
        description={description}
        id={id}
        onClick={onClick}
        LeftComponent={
          <AddToNavigationDragHandle
            icon={icon}
            payload={payload}
            isHovered={isHovered}
            draggable={false}
          />
        }
      />
    </StyledDraggableMenuItem>
  );
};
