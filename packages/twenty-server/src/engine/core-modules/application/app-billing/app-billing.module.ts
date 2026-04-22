import { Module } from '@nestjs/common';

import { AppBillingController } from 'src/engine/core-modules/application/app-billing/app-billing.controller';
import { AppBillingService } from 'src/engine/core-modules/application/app-billing/app-billing.service';
import { WorkspaceEventEmitterModule } from 'src/engine/workspace-event-emitter/workspace-event-emitter.module';

@Module({
  imports: [WorkspaceEventEmitterModule],
  controllers: [AppBillingController],
  providers: [AppBillingService],
  exports: [AppBillingService],
})
export class AppBillingModule {}
