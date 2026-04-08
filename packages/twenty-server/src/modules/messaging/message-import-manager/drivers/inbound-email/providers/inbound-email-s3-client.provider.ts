import { Injectable, Logger } from '@nestjs/common';

import { S3Client, type S3ClientConfig } from '@aws-sdk/client-s3';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

// Thin wrapper that lazily builds an S3 client using the inbound email config
// (INBOUND_EMAIL_S3_REGION falls back to AWS_SES_REGION, and AWS_SES_*
// credentials are reused). Returning `null` when the bucket is unconfigured
// lets callers short-circuit without throwing.
@Injectable()
export class InboundEmailS3ClientProvider {
  private readonly logger = new Logger(InboundEmailS3ClientProvider.name);
  private s3Client: S3Client | null = null;

  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  getBucketName(): string | null {
    const bucket = this.twentyConfigService.get('INBOUND_EMAIL_S3_BUCKET');

    return bucket && bucket.length > 0 ? bucket : null;
  }

  isConfigured(): boolean {
    return this.getBucketName() !== null;
  }

  getClient(): S3Client | null {
    const bucket = this.getBucketName();

    if (!bucket) {
      return null;
    }

    if (!this.s3Client) {
      const region =
        this.twentyConfigService.get('INBOUND_EMAIL_S3_REGION') ||
        this.twentyConfigService.get('AWS_SES_REGION');

      if (!region) {
        this.logger.warn(
          'Inbound email bucket is configured but no region is set. Set INBOUND_EMAIL_S3_REGION or AWS_SES_REGION.',
        );

        return null;
      }

      const config: S3ClientConfig = { region };

      const accessKeyId = this.twentyConfigService.get('AWS_SES_ACCESS_KEY_ID');
      const secretAccessKey = this.twentyConfigService.get(
        'AWS_SES_SECRET_ACCESS_KEY',
      );
      const sessionToken = this.twentyConfigService.get(
        'AWS_SES_SESSION_TOKEN',
      );

      if (accessKeyId && secretAccessKey) {
        config.credentials = {
          accessKeyId,
          secretAccessKey,
          ...(sessionToken ? { sessionToken } : {}),
        };
      }

      this.s3Client = new S3Client(config);
    }

    return this.s3Client;
  }
}
