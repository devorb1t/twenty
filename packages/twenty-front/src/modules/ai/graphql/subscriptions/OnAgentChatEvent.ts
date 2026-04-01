import { gql } from '@apollo/client';

export const ON_AGENT_CHAT_EVENT = gql`
  subscription OnAgentChatEvent($threadId: String!) {
    onAgentChatEvent(threadId: $threadId) {
      threadId
      event
    }
  }
`;
