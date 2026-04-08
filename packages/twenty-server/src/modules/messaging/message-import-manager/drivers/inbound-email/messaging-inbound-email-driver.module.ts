import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { MessagingCommonModule } from 'src/modules/messaging/common/messaging-common.module';
import { InboundEmailS3ClientProvider } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/providers/inbound-email-s3-client.provider';
import { InboundEmailImportService } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/services/inbound-email-import.service';
import { InboundEmailParserService } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/services/inbound-email-parser.service';
import { InboundEmailStorageService } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/services/inbound-email-storage.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageChannelEntity, ConnectedAccountEntity]),
    TwentyConfigModule,
    WorkspaceDataSourceModule,
    MessagingCommonModule,
  ],
  providers: [
    InboundEmailS3ClientProvider,
    InboundEmailStorageService,
    InboundEmailParserService,
    InboundEmailImportService,
  ],
  exports: [
    InboundEmailImportService,
    InboundEmailStorageService,
    InboundEmailS3ClientProvider,
  ],
})
export class MessagingInboundEmailDriverModule {}
