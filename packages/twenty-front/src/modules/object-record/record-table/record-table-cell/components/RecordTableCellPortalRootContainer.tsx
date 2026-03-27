import { styled } from '@linaria/react';

const StyledRecordTableCellPortalRootContainer = styled.div<{
  zIndex?: number;
  topOffset: number;
  leftOffset: number;
  widthExpansion: number;
  heightExpansion: number;
}>`
  height: calc(100% + ${({ heightExpansion }) => heightExpansion}px);
  left: ${({ leftOffset }) => leftOffset}px;
  position: absolute;
  top: ${({ topOffset }) => topOffset}px;
  width: calc(100% + ${({ widthExpansion }) => widthExpansion}px);
  z-index: ${({ zIndex }) => zIndex ?? 'auto'};
`;

export const RecordTableCellPortalRootContainer =
  StyledRecordTableCellPortalRootContainer;
