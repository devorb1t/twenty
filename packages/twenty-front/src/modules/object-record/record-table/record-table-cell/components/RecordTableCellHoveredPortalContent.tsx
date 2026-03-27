import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { FieldFocusStaticFocusedProvider } from '@/object-record/record-field/ui/contexts/FieldFocusContextProvider';
import { useIsFieldInputOnly } from '@/object-record/record-field/ui/hooks/useIsFieldInputOnly';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellDisplayMode } from '@/object-record/record-table/record-table-cell/components/RecordTableCellDisplayMode';
import { RecordTableCellEditButton } from '@/object-record/record-table/record-table-cell/components/RecordTableCellEditButton';
import { RecordTableCellEditMode } from '@/object-record/record-table/record-table-cell/components/RecordTableCellEditMode';
import { RecordTableCellFieldInput } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldInput';

import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledRecordTableCellHoveredPortalContent = styled.div<{
  showInteractiveStyle: boolean;
  isRecordTableRowActive: boolean;
  topExpansion: number;
  leftExpansion: number;
  rightExpansion: number;
  bottomExpansion: number;
}>`
  background: ${themeCssVariables.background.transparent.secondary};
  background-color: ${({ isRecordTableRowActive, showInteractiveStyle }) =>
    isRecordTableRowActive
      ? themeCssVariables.accent.quaternary
      : showInteractiveStyle
        ? themeCssVariables.background.primary
        : themeCssVariables.background.transparent.lighter};
  border-radius: ${({ showInteractiveStyle }) =>
    showInteractiveStyle ? themeCssVariables.border.radius.sm : 'none'};
  box-sizing: border-box;
  cursor: ${({ showInteractiveStyle }) =>
    showInteractiveStyle ? 'pointer' : 'default'};

  height: calc(
    100% +
      ${({ topExpansion, bottomExpansion }) => topExpansion + bottomExpansion}px
  );

  margin-left: ${({ leftExpansion }) => -leftExpansion}px;
  margin-top: ${({ topExpansion }) => -topExpansion}px;

  outline: ${({ showInteractiveStyle, isRecordTableRowActive }) =>
    isRecordTableRowActive
      ? 'none'
      : showInteractiveStyle
        ? `1px solid ${themeCssVariables.font.color.extraLight}`
        : `1px solid ${themeCssVariables.border.color.medium}`};
  outline-offset: -1px;

  position: relative;
  user-select: none;
  width: calc(
    100% +
      ${({ leftExpansion, rightExpansion }) => leftExpansion + rightExpansion}px
  );
`;

const StyledContentWrapper = styled.div<{
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

export const RecordTableCellHoveredPortalContent = () => {
  const recordTableHoverPosition = useAtomComponentStateValue(
    recordTableHoverPositionComponentState,
  );

  const isMobile = useIsMobile();

  const isFirstColumn = recordTableHoverPosition?.column === 0;

  const { isRecordFieldReadOnly: isReadOnly } = useContext(FieldContext);

  const isFieldInputOnly = useIsFieldInputOnly() && !isReadOnly;

  const showButton =
    !isFieldInputOnly &&
    (!isReadOnly || isFirstColumn) &&
    !(isMobile && isFirstColumn);

  const showInteractiveStyle = !isReadOnly || (isFirstColumn && showButton);

  const { rowIndex } = useRecordTableRowContextOrThrow();

  const isRecordTableRowActive = useAtomComponentFamilyStateValue(
    isRecordTableRowActiveComponentFamilyState,
    rowIndex,
  );

  const isTouchingHeader = recordTableHoverPosition?.row === 0;
  const isTouchingFirstColumn = recordTableHoverPosition?.column === 1;

  const topExpansion = showInteractiveStyle ? (isTouchingHeader ? 0 : 1) : 1;
  const leftExpansion = showInteractiveStyle
    ? isTouchingFirstColumn
      ? 0
      : 1
    : 1;
  const rightExpansion = 1;
  const bottomExpansion = 1;

  const contentTop = topExpansion;
  const contentLeft = leftExpansion;
  const contentWidth = `calc(100% - ${leftExpansion + rightExpansion}px)`;
  const contentHeight = `calc(100% - ${topExpansion + bottomExpansion}px)`;

  return (
    <StyledRecordTableCellHoveredPortalContent
      showInteractiveStyle={showInteractiveStyle}
      isRecordTableRowActive={isRecordTableRowActive}
      topExpansion={topExpansion}
      leftExpansion={leftExpansion}
      rightExpansion={rightExpansion}
      bottomExpansion={bottomExpansion}
    >
      <StyledContentWrapper
        contentTop={contentTop}
        contentLeft={contentLeft}
        contentWidth={contentWidth}
        contentHeight={contentHeight}
      >
        <FieldFocusStaticFocusedProvider>
          {isFieldInputOnly ? (
            <RecordTableCellEditMode>
              <RecordTableCellFieldInput />
            </RecordTableCellEditMode>
          ) : (
            <RecordTableCellDisplayMode>
              <FieldDisplay />
            </RecordTableCellDisplayMode>
          )}
        </FieldFocusStaticFocusedProvider>
        {showButton && <RecordTableCellEditButton />}
      </StyledContentWrapper>
    </StyledRecordTableCellHoveredPortalContent>
  );
};
