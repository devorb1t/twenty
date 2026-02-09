import styled from '@emotion/styled';
import { type ReactNode, useContext, useRef } from 'react';

import { ADD_TO_NAVIGATION_DRAG } from '@/navigation-menu-item/constants/AddToNavigationDrag.constants';
import { NavigationDropTargetContext } from '@/navigation-menu-item/contexts/NavigationDropTargetContext';
import { NAVIGATION_SECTIONS } from '@/navigation-menu-item/constants/NavigationSections.constants';
import type { NavigationSectionId } from '@/navigation-menu-item/types/NavigationSectionId';

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

export type NavigationItemDropTargetSectionId = NavigationSectionId;

type NavigationItemDropTargetProps = {
  folderId: string | null;
  index: number;
  sectionId: NavigationItemDropTargetSectionId;
  children?: ReactNode;
};

export const NavigationItemDropTarget = ({
  folderId,
  index,
  sectionId,
  children,
}: NavigationItemDropTargetProps) => {
  const {
    activeDropTargetId,
    setActiveDropTargetId,
    forbiddenDropTargetId,
    setForbiddenDropTargetId,
  } = useContext(NavigationDropTargetContext);
  const ref = useRef<HTMLDivElement>(null);
  const dropTargetId = `${sectionId}-${folderId ?? 'orphan'}-${index}`;
  const isDragOver = activeDropTargetId === dropTargetId;
  const isDropForbidden = forbiddenDropTargetId === dropTargetId;
  const isFolderTarget = folderId !== null;

  const handleDragOver = (event: React.DragEvent) => {
    if (!event.dataTransfer.types.includes(ADD_TO_NAVIGATION_DRAG.TYPE)) {
      return;
    }
    event.preventDefault();
    if (sectionId === NAVIGATION_SECTIONS.FAVORITES) {
      event.dataTransfer.dropEffect = 'none';
      setForbiddenDropTargetId(dropTargetId);
      setActiveDropTargetId(null);
      return;
    }
    const isFolderDrag = event.dataTransfer.types.includes(
      ADD_TO_NAVIGATION_DRAG.FOLDER_TYPE,
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
      data-navigation-drop-target=""
      data-navigation-drop-section={sectionId}
      data-navigation-drop-folder={folderId ?? 'orphan'}
      data-navigation-drop-index={String(index)}
    >
      {children}
    </StyledDropTarget>
  );
};
