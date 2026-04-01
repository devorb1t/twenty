import { Injectable } from '@nestjs/common';

import { type AgentChatSubscriptionEvent } from 'twenty-shared/ai';

import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';

@Injectable()
export class AgentChatEventPublisherService {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  async publish({
    threadId,
    workspaceId,
    event,
  }: {
    threadId: string;
    workspaceId: string;
    event: AgentChatSubscriptionEvent;
  }): Promise<void> {
    await this.subscriptionService.publishToAgentChat({
      workspaceId,
      threadId,
      payload: {
        onAgentChatEvent: {
          threadId,
          event,
        },
      },
    });
  }
}
