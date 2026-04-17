import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { AIChatAssistantMessageRenderer } from '@/ai/components/AIChatAssistantMessageRenderer';
import { AgentChatFilePreview } from '@/ai/components/internal/AgentChatFilePreview';
import { GET_WORKFLOW_AGENT_TRACE } from '@/ai/graphql/queries/getWorkflowAgentTrace';
import { mapDBMessagesToUIMessages } from '@/ai/utils/mapDBMessagesToUIMessages';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { WorkflowRunAiAgentTracePrompt } from '@/workflow/workflow-steps/components/WorkflowRunAiAgentTracePrompt';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import Skeleton from 'react-loading-skeleton';
import {
  type ExtendedUIMessagePart,
  isExtendedFileUIPart,
} from 'twenty-shared/ai';
import { getSafeUrl } from 'twenty-shared/utils';
import { AvatarOrIcon, Chip, ChipVariant } from 'twenty-ui/components';
import { IconExternalLink, IconFileText, IconWorld } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { StepStatus } from 'twenty-shared/workflow';
import {
  PermissionFlagType,
  type AgentMessage,
} from '~/generated-metadata/graphql';

type GetWorkflowAgentTraceResult = {
  workflowAgentTrace: {
    id: string;
    messages: AgentMessage[];
  } | null;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledMessagesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledAssistantMessage = styled.div`
  color: ${themeCssVariables.font.color.primary};
`;

const StyledAssistantMessageContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledSupplementaryPartsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledExternalSourceLink = styled.a`
  color: inherit;
  display: inline-flex;
  min-width: 0;
  text-decoration: none;
`;

const StyledTraceUnavailable = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
`;

type WorkflowTraceSourcePart =
  | Extract<ExtendedUIMessagePart, { type: 'source-url' }>
  | Extract<ExtendedUIMessagePart, { type: 'source-document' }>;

const extractPromptText = (userMessage: AgentMessage | undefined): string => {
  if (!userMessage) return '';

  return userMessage.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.textContent ?? '')
    .join('\n')
    .trim();
};

const isWorkflowTraceSourcePart = (
  part: ExtendedUIMessagePart,
): part is WorkflowTraceSourcePart =>
  part.type === 'source-url' || part.type === 'source-document';

const getWorkflowTraceSourceLabel = (sourcePart: WorkflowTraceSourcePart) => {
  if (sourcePart.type === 'source-url') {
    return sourcePart.title || sourcePart.url;
  }

  return (
    sourcePart.title || sourcePart.filename || sourcePart.mediaType || t`Source`
  );
};

const WorkflowTraceSourceChip = ({
  sourcePart,
}: {
  sourcePart: WorkflowTraceSourcePart;
}) => {
  const label = getWorkflowTraceSourceLabel(sourcePart);
  const sourceChip = (
    <Chip
      label={label}
      emptyLabel={t`Untitled`}
      variant={ChipVariant.Static}
      leftComponent={
        <AvatarOrIcon
          Icon={sourcePart.type === 'source-url' ? IconWorld : IconFileText}
        />
      }
      rightComponent={
        sourcePart.type === 'source-url' ? (
          <AvatarOrIcon Icon={IconExternalLink} />
        ) : undefined
      }
      rightComponentDivider={sourcePart.type === 'source-url'}
    />
  );

  const safeHref =
    sourcePart.type === 'source-url' ? getSafeUrl(sourcePart.url) : undefined;

  if (safeHref) {
    return (
      <StyledExternalSourceLink
        href={safeHref}
        target="_blank"
        rel="noopener noreferrer"
      >
        {sourceChip}
      </StyledExternalSourceLink>
    );
  }

  return sourceChip;
};

type WorkflowRunAiAgentTraceDetailProps = {
  workflowRunId: string;
  workflowStepId: string;
  status: StepStatus;
};

const shouldQueryTraceForStatus = (status: StepStatus) =>
  status !== StepStatus.NOT_STARTED &&
  status !== StepStatus.PENDING &&
  status !== StepStatus.RUNNING;

export const WorkflowRunAiAgentTraceDetail = ({
  workflowRunId,
  workflowStepId,
  status,
}: WorkflowRunAiAgentTraceDetailProps) => {
  const permissionMap = usePermissionFlagMap();
  const hasAiPermission = permissionMap[PermissionFlagType.AI];

  const { data, loading } = useQuery<GetWorkflowAgentTraceResult>(
    GET_WORKFLOW_AGENT_TRACE,
    {
      variables: { workflowRunId, workflowStepId },
      fetchPolicy: 'cache-and-network',
      skip: !hasAiPermission || !shouldQueryTraceForStatus(status),
    },
  );

  if (loading) {
    return <Skeleton height={SKELETON_LOADER_HEIGHT_SIZES.columns.m} />;
  }

  const turn = data?.workflowAgentTrace;

  if (!turn || turn.messages.length === 0) {
    return (
      <StyledTraceUnavailable>{t`Trace unavailable`}</StyledTraceUnavailable>
    );
  }

  const userMessage = turn.messages.find((message) => message.role === 'user');
  const assistantMessages = turn.messages.filter(
    (message) => message.role === 'assistant' && message.parts.length > 0,
  );
  const promptText = extractPromptText(userMessage);
  const uiMessages = mapDBMessagesToUIMessages(assistantMessages);

  return (
    <StyledContainer>
      <WorkflowRunAiAgentTracePrompt promptText={promptText} />
      <StyledMessagesList>
        {uiMessages.map((message) => {
          const renderableMessageParts = message.parts.filter(
            (part) =>
              part.type !== 'file' &&
              part.type !== 'source-url' &&
              part.type !== 'source-document',
          );
          const fileParts = message.parts.filter(isExtendedFileUIPart);
          const sourceParts = message.parts.filter(isWorkflowTraceSourcePart);

          return (
            <StyledAssistantMessage key={message.id}>
              <StyledAssistantMessageContent>
                {renderableMessageParts.length > 0 && (
                  <AIChatAssistantMessageRenderer
                    messageParts={renderableMessageParts}
                    isLastMessageStreaming={false}
                  />
                )}
                {(fileParts.length > 0 || sourceParts.length > 0) && (
                  <StyledSupplementaryPartsContainer>
                    {fileParts.map((filePart) => (
                      <AgentChatFilePreview
                        key={filePart.fileId}
                        file={filePart}
                      />
                    ))}
                    {sourceParts.map((sourcePart) => (
                      <WorkflowTraceSourceChip
                        key={`${sourcePart.type}-${sourcePart.sourceId}`}
                        sourcePart={sourcePart}
                      />
                    ))}
                  </StyledSupplementaryPartsContainer>
                )}
              </StyledAssistantMessageContent>
            </StyledAssistantMessage>
          );
        })}
      </StyledMessagesList>
    </StyledContainer>
  );
};
