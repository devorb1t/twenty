import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { IconChevronRight } from 'twenty-ui/display';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledPromptSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledPromptToggle = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  gap: ${themeCssVariables.spacing[2]};
  line-height: ${themeCssVariables.text.lineHeight.md};
  min-height: 24px;
  padding: 0;
  transition: color calc(${themeCssVariables.animation.duration.fast} * 1s)
    ease-in-out;
  width: fit-content;

  &:hover {
    color: ${themeCssVariables.font.color.primary};
  }

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.blue};
    outline-offset: 2px;
  }
`;

const StyledChevron = styled.span<{ isExpanded: boolean }>`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: inline-flex;
  justify-content: center;
  transform: rotate(${({ isExpanded }) => (isExpanded ? '90deg' : '0deg')});
  transition: transform calc(${themeCssVariables.animation.duration.fast} * 1s)
    ease-in-out;
`;

const StyledPromptBody = styled.div`
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  margin-top: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[3]};
  white-space: pre-wrap;
`;

export const WorkflowRunAiAgentTracePrompt = ({
  promptText,
}: {
  promptText: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (promptText.length === 0) {
    return null;
  }

  return (
    <StyledPromptSection>
      <StyledPromptToggle
        type="button"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((previous) => !previous)}
      >
        <StyledChevron isExpanded={isExpanded}>
          <IconChevronRight size={14} />
        </StyledChevron>
        {t`Prompt`}
      </StyledPromptToggle>
      <AnimatedExpandableContainer isExpanded={isExpanded} mode="fit-content">
        <StyledPromptBody>{promptText}</StyledPromptBody>
      </AnimatedExpandableContainer>
    </StyledPromptSection>
  );
};
