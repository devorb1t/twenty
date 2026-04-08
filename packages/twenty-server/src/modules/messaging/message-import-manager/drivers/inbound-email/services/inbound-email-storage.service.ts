import { Injectable, Logger } from '@nestjs/common';

import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  type ListObjectsV2CommandOutput,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';

import { INBOUND_EMAIL_S3_PREFIXES } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/constants/inbound-email.constants';
import { InboundEmailS3ClientProvider } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/providers/inbound-email-s3-client.provider';

export type InboundEmailListResult = {
  keys: string[];
  isTruncated: boolean;
};

@Injectable()
export class InboundEmailStorageService {
  private readonly logger = new Logger(InboundEmailStorageService.name);

  constructor(
    private readonly s3ClientProvider: InboundEmailS3ClientProvider,
  ) {}

  async listIncoming(maxKeys: number): Promise<InboundEmailListResult> {
    const client = this.s3ClientProvider.getClient();
    const bucket = this.s3ClientProvider.getBucketName();

    if (!client || !bucket) {
      return { keys: [], isTruncated: false };
    }

    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: INBOUND_EMAIL_S3_PREFIXES.INCOMING,
      MaxKeys: maxKeys,
    });

    const response: ListObjectsV2CommandOutput = await client.send(command);

    const keys =
      response.Contents?.map((content) => content.Key).filter(
        (key): key is string => typeof key === 'string',
      ) ?? [];

    return {
      keys,
      isTruncated: response.IsTruncated === true,
    };
  }

  async getRawMessage(key: string): Promise<Buffer> {
    const client = this.s3ClientProvider.getClient();
    const bucket = this.s3ClientProvider.getBucketName();

    if (!client || !bucket) {
      throw new Error('Inbound email S3 bucket is not configured');
    }

    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await client.send(command);

    if (!response.Body) {
      throw new Error(`Empty body for S3 key ${key}`);
    }

    return this.streamToBuffer(response.Body as Readable);
  }

  async moveToProcessed(key: string): Promise<void> {
    await this.moveKey(key, this.buildArchiveKey(key, 'PROCESSED'));
  }

  async moveToUnmatched(key: string): Promise<void> {
    await this.moveKey(key, this.buildArchiveKey(key, 'UNMATCHED'));
  }

  async moveToFailed(key: string): Promise<void> {
    await this.moveKey(key, this.buildArchiveKey(key, 'FAILED'));
  }

  private buildArchiveKey(
    originalKey: string,
    destination: 'PROCESSED' | 'UNMATCHED' | 'FAILED',
  ): string {
    const bare = originalKey.startsWith(INBOUND_EMAIL_S3_PREFIXES.INCOMING)
      ? originalKey.slice(INBOUND_EMAIL_S3_PREFIXES.INCOMING.length)
      : originalKey;

    // YYYY-MM-DD date prefix so old archives can be pruned by lifecycle rules.
    const datePrefix = new Date().toISOString().slice(0, 10);

    return `${INBOUND_EMAIL_S3_PREFIXES[destination]}${datePrefix}/${bare}`;
  }

  private async moveKey(sourceKey: string, destKey: string): Promise<void> {
    const client = this.s3ClientProvider.getClient();
    const bucket = this.s3ClientProvider.getBucketName();

    if (!client || !bucket) {
      this.logger.warn(
        `Cannot move inbound email S3 key ${sourceKey}: bucket not configured`,
      );

      return;
    }

    await client.send(
      new CopyObjectCommand({
        Bucket: bucket,
        CopySource: `${bucket}/${sourceKey}`,
        Key: destKey,
      }),
    );

    await client.send(
      new DeleteObjectCommand({ Bucket: bucket, Key: sourceKey }),
    );
  }

  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
  }
}
