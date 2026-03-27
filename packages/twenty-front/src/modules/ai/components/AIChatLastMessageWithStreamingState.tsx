import { AIChatMessage } from '@/ai/components/AIChatMessage';
import { agentChatErrorState } from '@/ai/states/agentChatErrorState';
import { agentChatIsStreamingState } from '@/ai/states/agentChatIsStreamingState';
import { agentChatLastMessageIdComponentSelector } from '@/ai/states/agentChatLastMessageIdComponentSelector';
import { agentChatMessageComponentFamilySelector } from '@/ai/states/agentChatMessageComponentFamilySelector';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

const messageMap = new Map<string, ExtendedUIMessage>();

export const AIChatLastMessageWithStreamingState = () => {
  const lastMessageId = useAtomComponentSelectorValue(
    agentChatLastMessageIdComponentSelector,
  );

  const agentChatIsStreaming = useAtomStateValue(agentChatIsStreamingState);
  const agentChatError = useAtomStateValue(agentChatErrorState);

  const agentChatMessage = useAtomComponentFamilySelectorValue(
    agentChatMessageComponentFamilySelector,
    { messageId: lastMessageId },
  );

  messageMap.set(new Date().toISOString(), agentChatMessage!);

  console.log({
    messageMap,
  });

  if (!isDefined(lastMessageId)) {
    return null;
  }

  return (
    <AIChatMessage
      messageId={lastMessageId}
      isLastMessageStreaming={agentChatIsStreaming}
      error={agentChatError ?? undefined}
    />
  );
};
