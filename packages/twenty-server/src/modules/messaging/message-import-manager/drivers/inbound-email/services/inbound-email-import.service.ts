import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { MessageChannelType } from 'twenty-shared/types';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import {
  InboundEmailParserService,
  type InboundEmailParseResult,
} from 'src/modules/messaging/message-import-manager/drivers/inbound-email/services/inbound-email-parser.service';
import { InboundEmailStorageService } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/services/inbound-email-storage.service';
import {
  extractEnvelopeRecipientForDomain,
  extractLocalPart,
} from 'src/modules/messaging/message-import-manager/drivers/inbound-email/utils/extract-envelope-recipient.util';
import { MessagingSaveMessagesAndEnqueueContactCreationService } from 'src/modules/messaging/message-import-manager/services/messaging-save-messages-and-enqueue-contact-creation.service';

export type InboundEmailImportOutcome =
  | 'imported'
  | 'unmatched'
  | 'duplicate'
  | 'loop_dropped'
  | 'unconfigured'
  | 'parse_failed'
  | 'persist_failed';

@Injectable()
export class InboundEmailImportService {
  private readonly logger = new Logger(InboundEmailImportService.name);

  constructor(
    private readonly storage: InboundEmailStorageService,
    private readonly parser: InboundEmailParserService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    private readonly saveMessagesService: MessagingSaveMessagesAndEnqueueContactCreationService,
  ) {}

  async importFromS3Key(s3Key: string): Promise<InboundEmailImportOutcome> {
    const domain = this.twentyConfigService.get('INBOUND_EMAIL_DOMAIN');

    if (!domain) {
      this.logger.warn(
        'INBOUND_EMAIL_DOMAIN is not configured; leaving inbound message in place',
      );

      return 'unconfigured';
    }

    let raw: Buffer;

    try {
      raw = await this.storage.getRawMessage(s3Key);
    } catch (error) {
      this.logger.error(
        `Failed to fetch inbound email S3 object ${s3Key}: ${(error as Error).message}`,
      );
      await this.safeMoveToFailed(s3Key);

      return 'persist_failed';
    }

    let parseResult: InboundEmailParseResult;

    try {
      parseResult = await this.parser.parseRawMessage(raw, s3Key);
    } catch (error) {
      this.logger.error(
        `Failed to parse inbound email ${s3Key}: ${(error as Error).message}`,
      );
      await this.safeMoveToFailed(s3Key);

      return 'parse_failed';
    }

    const envelopeRecipient = extractEnvelopeRecipientForDomain(
      parseResult.parsed,
      domain,
    );

    if (!envelopeRecipient) {
      this.logger.log(
        `Inbound email ${s3Key} has no recipient at ${domain}; archiving as unmatched`,
      );
      await this.storage.moveToUnmatched(s3Key);

      return 'unmatched';
    }

    const localPart = extractLocalPart(envelopeRecipient);

    const channel = await this.findChannelByLocalPart(localPart);

    if (!channel) {
      this.logger.log(
        `No email forwarding channel matches inbound address ${envelopeRecipient}`,
      );
      await this.storage.moveToUnmatched(s3Key);

      return 'unmatched';
    }

    // Loop prevention: messages we sent ourselves carry X-Twenty-Origin with
    // our workspace id. If the group echoes our send back, we drop it.
    if (parseResult.originWorkspaceId === channel.workspaceId) {
      this.logger.log(
        `Dropping inbound email ${s3Key} as self-echo from workspace ${channel.workspaceId}`,
      );
      await this.storage.moveToProcessed(s3Key);

      return 'loop_dropped';
    }

    try {
      await this.persistMessage(channel, parseResult);
    } catch (error) {
      this.logger.error(
        `Failed to persist inbound email ${s3Key}: ${(error as Error).message}`,
      );
      await this.safeMoveToFailed(s3Key);

      return 'persist_failed';
    }

    await this.storage.moveToProcessed(s3Key);

    return 'imported';
  }

  private async findChannelByLocalPart(
    localPart: string,
  ): Promise<MessageChannelEntity | null> {
    const domain = this.twentyConfigService.get('INBOUND_EMAIL_DOMAIN');

    if (!domain) {
      return null;
    }

    const fullAddress = `${localPart}@${domain}`.toLowerCase();

    // Email forwarding channels are uniquely keyed on handle + type.
    return this.messageChannelRepository.findOne({
      where: {
        handle: fullAddress,
        type: MessageChannelType.EMAIL_FORWARDING,
      },
      relations: { connectedAccount: true },
    });
  }

  private async persistMessage(
    channel: MessageChannelEntity,
    parseResult: InboundEmailParseResult,
  ): Promise<void> {
    const connectedAccount = await this.connectedAccountRepository.findOne({
      where: { id: channel.connectedAccountId },
    });

    if (!connectedAccount) {
      throw new Error(
        `Connected account ${channel.connectedAccountId} missing for email forwarding channel ${channel.id}`,
      );
    }

    const authContext = buildSystemAuthContext(channel.workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        await this.saveMessagesService.saveMessagesAndEnqueueContactCreation(
          [parseResult.message],
          channel,
          connectedAccount,
          channel.workspaceId,
        );
      },
      authContext,
    );
  }

  private async safeMoveToFailed(s3Key: string): Promise<void> {
    try {
      await this.storage.moveToFailed(s3Key);
    } catch (moveError) {
      this.logger.error(
        `Failed to move ${s3Key} to failed/: ${(moveError as Error).message}`,
      );
    }
  }
}
