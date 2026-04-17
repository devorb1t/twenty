import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { type AgentMessagePartEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message-part.entity';
import { mapPersistablePartsToDBParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/mapPersistablePartsToDBParts';
import { mapUIMessagePartsToPersistableParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/mapUIMessagePartsToPersistableParts';

export const mapUIMessagePartsToDBParts = (
  uiMessageParts: ExtendedUIMessagePart[],
  messageId: string,
  workspaceId: string,
): Partial<AgentMessagePartEntity>[] => {
  return mapPersistablePartsToDBParts(
    mapUIMessagePartsToPersistableParts(uiMessageParts),
    messageId,
    workspaceId,
  );
};
