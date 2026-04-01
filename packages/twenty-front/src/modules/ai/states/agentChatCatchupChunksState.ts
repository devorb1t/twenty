import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type AgentChatCatchupChunks = {
  chunks: Record<string, unknown>[];
  maxSeq: number;
};

export const agentChatCatchupChunksState =
  createAtomState<AgentChatCatchupChunks | null>({
    key: 'agentChatCatchupChunksState',
    defaultValue: null,
  });
