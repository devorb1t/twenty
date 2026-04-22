import { Module } from '@nestjs/common';

import { AppBillingController } from 'src/engine/core-modules/application/app-billing/app-billing.controller';
import { AppBillingService } from 'src/engine/core-modules/application/app-billing/app-billing.service';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceEventEmitterModule } from 'src/engine/workspace-event-emitter/workspace-event-emitter.module';

@Module({
  imports: [
    AuthModule,
    WorkspaceCacheStorageModule,
    WorkspaceEventEmitterModule,
  ],
  controllers: [AppBillingController],
  providers: [AppBillingService],
  exports: [AppBillingService],
})
export class AppBillingModule {}
