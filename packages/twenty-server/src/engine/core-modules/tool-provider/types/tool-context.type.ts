import { type ActorMetadata } from 'twenty-shared/types';

import { type CodeExecutionStreamEmitter } from 'src/engine/core-modules/tool-provider/interfaces/code-execution-stream-emitter.type';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatAgentWithRoleId } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

// weird?
// why do we need role permission config here?
// is this file also used in agent chat?
// if so, aghent chat already has role permission config?
export type ToolContext = {
  workspaceId: string;
  roleId: string;
  rolePermissionConfig?: RolePermissionConfig;
  authContext?: WorkspaceAuthContext;
  actorContext?: ActorMetadata;
  agent?: FlatAgentWithRoleId | null;
  userId?: string;
  userWorkspaceId?: string;
  onCodeExecutionUpdate?: CodeExecutionStreamEmitter;
};
