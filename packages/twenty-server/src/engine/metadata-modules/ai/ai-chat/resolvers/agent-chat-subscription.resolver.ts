import { Args, Subscription } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import { AgentChatEventDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-event.dto';

@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class AgentChatSubscriptionResolver {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Subscription(() => AgentChatEventDTO, {
    filter: (
      payload: { onAgentChatEvent: AgentChatEventDTO },
      variables: { threadId: string },
    ) => {
      return payload.onAgentChatEvent.threadId === variables.threadId;
    },
  })
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.AI))
  onAgentChatEvent(
    @Args('threadId') _threadId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    return this.subscriptionService.subscribeToAgentChat({
      workspaceId: workspace.id,
      threadId: _threadId,
    });
  }
}
