import { type ReactNode } from 'react';
import styled from '@emotion/styled';

import { getNavigationDropTargetProps } from '@/navigation-menu-item/components/NavigationSidebarNativeDropZone';

const StyledDropTarget = styled.div`
  min-height: ${({ theme }) => theme.spacing(2)};
`;

type NavigationItemDropTargetProps = {
  folderId: string | null;
  index: number;
  children?: ReactNode;
};

export const NavigationItemDropTarget = ({
  folderId,
  index,
  children,
}: NavigationItemDropTargetProps) => {
  return (
    <StyledDropTarget {...getNavigationDropTargetProps(folderId, index)}>
      {children}
    </StyledDropTarget>
  );
};
