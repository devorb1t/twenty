import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { useRecordTableBodyContextOrThrow } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellDisplayMode } from '@/object-record/record-table/record-table-cell/components/RecordTableCellDisplayMode';

import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRecordTableCellFocusPortalContent = styled.div<{
  isRecordTableRowActive: boolean;
}>`
  background: ${themeCssVariables.background.transparent.secondary};
  background-color: ${({ isRecordTableRowActive }) =>
    isRecordTableRowActive
      ? themeCssVariables.accent.quaternary
      : themeCssVariables.background.primary};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;

  height: 100%;

  outline: 1px solid ${themeCssVariables.color.blue8};
  outline-offset: -1px;

  position: relative;
  user-select: none;
`;

const StyledFocusedContentWrapper = styled.div<{
  contentTop: number;
  contentLeft: number;
  contentWidth: string;
  contentHeight: string;
}>`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  height: ${({ contentHeight }) => contentHeight};
  left: ${({ contentLeft }) => contentLeft}px;
  position: absolute;
  top: ${({ contentTop }) => contentTop}px;
  width: ${({ contentWidth }) => contentWidth};
`;

export const RecordTableCellFocusedPortalContent = () => {
  const { rowIndex } = useRecordTableRowContextOrThrow();
  const { onMoveHoverToCurrentCell } = useRecordTableBodyContextOrThrow();

  const recordTableFocusPosition = useAtomComponentStateValue(
    recordTableFocusPositionComponentState,
  );

  const isRecordTableRowActive = useAtomComponentFamilyStateValue(
    isRecordTableRowActiveComponentFamilyState,
    rowIndex,
  );

  const recordTableHoverPosition = useAtomComponentStateValue(
    recordTableHoverPositionComponentState,
  );

  const arePositionsDifferent =
    recordTableHoverPosition?.row !== recordTableFocusPosition?.row ||
    recordTableHoverPosition?.column !== recordTableFocusPosition?.column;

  const handleContainerMouseMove = () => {
    if (arePositionsDifferent && isDefined(recordTableFocusPosition)) {
      onMoveHoverToCurrentCell(recordTableFocusPosition);
    }
  };

  const isTouchingHeader = recordTableFocusPosition?.row === 0;
  const isTouchingFirstColumn = recordTableFocusPosition?.column === 1;

  const contentTop = isTouchingHeader ? 0 : 1;
  const contentLeft = isTouchingFirstColumn ? 0 : 1;
  const contentWidth = isTouchingFirstColumn
    ? 'calc(100% - 1px)'
    : 'calc(100% - 2px)';
  const contentHeight = isTouchingHeader
    ? 'calc(100% - 1px)'
    : 'calc(100% - 2px)';

  return (
    <StyledRecordTableCellFocusPortalContent
      isRecordTableRowActive={isRecordTableRowActive}
      onMouseMove={handleContainerMouseMove}
    >
      <StyledFocusedContentWrapper
        contentTop={contentTop}
        contentLeft={contentLeft}
        contentWidth={contentWidth}
        contentHeight={contentHeight}
      >
        <RecordTableCellDisplayMode>
          <FieldDisplay />
        </RecordTableCellDisplayMode>
      </StyledFocusedContentWrapper>
    </StyledRecordTableCellFocusPortalContent>
  );
};
