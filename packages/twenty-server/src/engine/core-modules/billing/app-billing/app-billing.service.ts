import { Injectable, Logger } from '@nestjs/common';

import { type ChargeDto } from 'src/engine/core-modules/billing/app-billing/dtos/charge.dto';
import { USAGE_RECORDED } from 'src/engine/core-modules/usage/constants/usage-recorded.constant';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type UsageEvent } from 'src/engine/core-modules/usage/types/usage-event.type';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

// Receives billing events from installed apps and emits USAGE_RECORDED
// workspace events. `workspaceId` and `applicationId` come from the
// application-access token on the request, never from the body, so an app
// cannot charge a different workspace or masquerade as a different app.
@Injectable()
export class AppBillingService {
  private readonly logger = new Logger(AppBillingService.name);

  constructor(private readonly workspaceEventEmitter: WorkspaceEventEmitter) {}

  emitChargeEvent(params: {
    workspaceId: string;
    applicationId: string;
    userWorkspaceId?: string | null;
    charge: ChargeDto;
  }): void {
    const { workspaceId, applicationId, userWorkspaceId, charge } = params;

    this.logger.log(
      `App charge from applicationId=${applicationId} workspaceId=${workspaceId}: ` +
        `${charge.creditsUsedMicro} micro-credits (${charge.quantity} ${charge.unit}, ` +
        `${charge.operationType})`,
    );

    this.workspaceEventEmitter.emitCustomBatchEvent<UsageEvent>(
      USAGE_RECORDED,
      [
        {
          resourceType: UsageResourceType.APP,
          operationType: charge.operationType,
          creditsUsedMicro: charge.creditsUsedMicro,
          quantity: charge.quantity,
          unit: charge.unit,
          resourceId: applicationId,
          resourceContext: charge.resourceContext ?? null,
          userWorkspaceId: userWorkspaceId ?? null,
        },
      ],
      workspaceId,
    );
  }
}
