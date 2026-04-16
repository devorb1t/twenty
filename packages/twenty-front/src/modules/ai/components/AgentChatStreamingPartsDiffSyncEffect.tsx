import { useCallback, useEffect, useRef } from 'react';

import { AGENT_CHAT_INSTANCE_ID } from '@/ai/constants/AgentChatInstanceId';
import { useUpdateStreamingPartsWithDiff } from '@/ai/hooks/useUpdateStreamingPartsWithDiff';
import { agentChatLastDiffSyncedThreadState } from '@/ai/states/agentChatLastDiffSyncedThreadState';
import { agentChatMessageComponentFamilyState } from '@/ai/states/agentChatMessageComponentFamilyState';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const AgentChatStreamingPartsDiffSyncEffect = () => {
  const currentAIChatThread = useAtomStateValue(currentAIChatThreadState);

  const agentChatMessages = useAtomComponentFamilyStateValue(
    agentChatMessagesComponentFamilyState,
    { threadId: currentAIChatThread },
  );

  const { updateStreamingPartsWithDiff } = useUpdateStreamingPartsWithDiff();

  const setAgentChatLastDiffSyncedThread = useSetAtomState(
    agentChatLastDiffSyncedThreadState,
  );

  const trackedMessageIdsRef = useRef<Set<string>>(new Set());

  const evictTrackedMessageAtoms = useCallback(() => {
    for (const messageId of trackedMessageIdsRef.current) {
      agentChatMessageComponentFamilyState.evictFamilyKey({
        instanceId: AGENT_CHAT_INSTANCE_ID,
        familyKey: messageId,
      });
    }
    trackedMessageIdsRef.current.clear();
  }, []);

  useEffect(() => {
    return () => {
      evictTrackedMessageAtoms();
    };
  }, [currentAIChatThread, evictTrackedMessageAtoms]);

  useEffect(() => {
    if (agentChatMessages.length === 0) {
      return;
    }

    const currentIds = new Set(agentChatMessages.map((m) => m.id));
    trackedMessageIdsRef.current = currentIds;

    updateStreamingPartsWithDiff(agentChatMessages);
    setAgentChatLastDiffSyncedThread(currentAIChatThread);
  }, [
    agentChatMessages,
    updateStreamingPartsWithDiff,
    currentAIChatThread,
    setAgentChatLastDiffSyncedThread,
  ]);

  return null;
};
