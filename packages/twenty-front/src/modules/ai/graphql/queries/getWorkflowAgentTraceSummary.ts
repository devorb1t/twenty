import { gql } from '@apollo/client';

export const GET_WORKFLOW_AGENT_TRACE_SUMMARY = gql`
  query GetWorkflowAgentTraceSummary(
    $workflowRunId: UUID!
    $workflowStepId: String!
  ) {
    workflowAgentTrace(
      workflowRunId: $workflowRunId
      workflowStepId: $workflowStepId
    ) {
      id
      thread {
        id
        totalInputTokens
        totalOutputTokens
        totalInputCredits
        totalOutputCredits
      }
    }
  }
`;
