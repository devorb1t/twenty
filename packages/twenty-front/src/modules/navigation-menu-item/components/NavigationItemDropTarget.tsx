import { type ReactNode, useContext, useRef } from 'react';
import styled from '@emotion/styled';

import { getNavigationDropTargetProps } from '@/navigation-menu-item/components/NavigationSidebarNativeDropZone';
import { NavigationDropTargetContext } from '@/navigation-menu-item/contexts/NavigationDropTargetContext';
import {
  ADD_TO_NAVIGATION_DRAG_FOLDER_TYPE,
  ADD_TO_NAVIGATION_DRAG_TYPE,
} from '@/navigation-menu-item/constants/AddToNavigationDrag.constants';

const StyledDropTarget = styled.div<{
  $isDragOver: boolean;
  $isDropForbidden: boolean;
}>`
  min-height: ${({ theme }) => theme.spacing(2)};
  position: relative;
  transition: all 150ms ease-in-out;

  ${({ $isDragOver, theme }) =>
    $isDragOver &&
    `
    background-color: ${theme.background.transparent.blue};

    &::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: ${theme.color.blue};
      border-radius: ${theme.border.radius.sm} ${theme.border.radius.sm} 0 0;
    }
  `}

  ${({ $isDropForbidden, theme }) =>
    $isDropForbidden &&
    `
    background-color: ${theme.background.transparent.danger};
    cursor: not-allowed;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: ${theme.color.red};
      border-radius: ${theme.border.radius.sm} ${theme.border.radius.sm} 0 0;
    }
  `}
`;

type NavigationItemDropTargetProps = {
  folderId: string | null;
  index: number;
  children?: ReactNode;
};

const getDropTargetId = (folderId: string | null, index: number) =>
  `${folderId ?? 'orphan'}-${index}`;

export const NavigationItemDropTarget = ({
  folderId,
  index,
  children,
}: NavigationItemDropTargetProps) => {
  const {
    activeDropTargetId,
    setActiveDropTargetId,
    forbiddenDropTargetId,
    setForbiddenDropTargetId,
  } = useContext(NavigationDropTargetContext);
  const ref = useRef<HTMLDivElement>(null);
  const dropTargetProps = getNavigationDropTargetProps(folderId, index);
  const dropTargetId = getDropTargetId(folderId, index);
  const isDragOver = activeDropTargetId === dropTargetId;
  const isDropForbidden = forbiddenDropTargetId === dropTargetId;
  const isFolderTarget = folderId !== null;

  const handleDragOver = (event: React.DragEvent) => {
    if (!event.dataTransfer.types.includes(ADD_TO_NAVIGATION_DRAG_TYPE)) {
      return;
    }
    event.preventDefault();
    const isFolderDrag = event.dataTransfer.types.includes(
      ADD_TO_NAVIGATION_DRAG_FOLDER_TYPE,
    );
    const isFolderOverFolder = isFolderTarget && isFolderDrag;

    if (isFolderOverFolder) {
      event.dataTransfer.dropEffect = 'none';
      setForbiddenDropTargetId(dropTargetId);
      setActiveDropTargetId(null);
    } else {
      event.dataTransfer.dropEffect = 'copy';
      setActiveDropTargetId(dropTargetId);
      setForbiddenDropTargetId(null);
    }
  };

  const handleDragLeave = (event: React.DragEvent) => {
    const relatedTarget = event.relatedTarget as Node | null;
    if (!ref.current?.contains(relatedTarget)) {
      setActiveDropTargetId(null);
      setForbiddenDropTargetId(null);
    }
  };

  return (
    <StyledDropTarget
      ref={ref}
      $isDragOver={isDragOver}
      $isDropForbidden={isDropForbidden}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...dropTargetProps}
    >
      {children}
    </StyledDropTarget>
  );
};
