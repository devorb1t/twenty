import styled from '@emotion/styled';
import { Draggable } from '@hello-pangea/dnd';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { type IconComponent } from 'twenty-ui/display';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { AddToNavigationDragHandle } from '@/navigation-menu-item/components/AddToNavigationDragHandle';
import type { AddToNavigationDragPayload } from '@/navigation-menu-item/types/add-to-navigation-drag-payload';
import { getAddToNavDraggableId } from '@/navigation-menu-item/utils/addToNavDraggableId';

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
  dragIndex?: number;
};

export const CommandMenuItemWithAddToNavigationDrag = ({
  icon,
  label,
  description,
  id,
  onClick,
  payload,
  dragIndex,
}: CommandMenuItemWithAddToNavigationDragProps) => {
  const { t } = useLingui();
  const [isHovered, setIsHovered] = useState(false);
  const contextualDescription = isHovered
    ? t`Drag to add to navbar`
    : description;

  const DragHandleIcon = () => (
    <AddToNavigationDragHandle
      icon={icon}
      payload={payload}
      isHovered={isHovered}
    />
  );

  const menuItemContent = (
    <StyledDraggableMenuItem
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CommandMenuItem
        Icon={DragHandleIcon}
        label={label}
        description={contextualDescription}
        id={id}
        onClick={onClick}
      />
    </StyledDraggableMenuItem>
  );

  if (dragIndex !== undefined) {
    const draggableId = getAddToNavDraggableId(payload);
    return (
      <Draggable
        draggableId={draggableId}
        index={dragIndex}
        isDragDisabled={false}
      >
        {(provided) => (
          <div
            ref={provided.innerRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...provided.draggableProps}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...provided.dragHandleProps}
          >
            {menuItemContent}
          </div>
        )}
      </Draggable>
    );
  }

  return menuItemContent;
};
