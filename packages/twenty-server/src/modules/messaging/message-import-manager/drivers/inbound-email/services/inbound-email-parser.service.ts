import { Injectable, Logger } from '@nestjs/common';

import PostalMime, {
  type Address,
  type Email as ParsedEmail,
} from 'postal-mime';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { MessageParticipantRole } from 'twenty-shared/types';

import { INBOUND_EMAIL_ORIGIN_HEADER } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/constants/inbound-email.constants';
import { type EmailAddress } from 'src/modules/messaging/message-import-manager/types/email-address';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
import { formatAddressObjectAsParticipants } from 'src/modules/messaging/message-import-manager/utils/format-address-object-as-participants.util';
import { sanitizeString } from 'src/modules/messaging/message-import-manager/utils/sanitize-string.util';

export type InboundEmailParseResult = {
  parsed: ParsedEmail;
  message: MessageWithParticipants;
  originWorkspaceId: string | null;
};

@Injectable()
export class InboundEmailParserService {
  private readonly logger = new Logger(InboundEmailParserService.name);

  async parseRawMessage(
    raw: Buffer,
    s3Key: string,
  ): Promise<InboundEmailParseResult> {
    const parsed = await PostalMime.parse(raw);

    const externalId = parsed.messageId?.trim() || `s3:${s3Key}`;
    const messageThreadExternalId = this.extractThreadId(parsed, externalId);

    const text = sanitizeString(parsed.text ?? '');

    const message: MessageWithParticipants = {
      externalId,
      messageThreadExternalId,
      headerMessageId: parsed.messageId || externalId,
      subject: sanitizeString(parsed.subject || ''),
      text,
      receivedAt: parsed.date ? new Date(parsed.date) : new Date(),
      direction: MessageDirection.INCOMING,
      attachments: (parsed.attachments || []).map((attachment) => ({
        filename: attachment.filename || 'unnamed-attachment',
      })),
      participants: this.extractParticipants(parsed),
    };

    return {
      parsed,
      message,
      originWorkspaceId: this.extractOriginWorkspaceId(parsed),
    };
  }

  private extractThreadId(parsed: ParsedEmail, fallback: string): string {
    if (Array.isArray(parsed.references) && parsed.references[0]?.trim()) {
      return parsed.references[0].trim();
    }

    if (parsed.inReplyTo) {
      const inReplyTo = String(parsed.inReplyTo).trim();

      if (inReplyTo) {
        return inReplyTo;
      }
    }

    return fallback;
  }

  private extractParticipants(parsed: ParsedEmail) {
    const addressFields = [
      { field: parsed.from, role: MessageParticipantRole.FROM },
      { field: parsed.to, role: MessageParticipantRole.TO },
      { field: parsed.cc, role: MessageParticipantRole.CC },
      { field: parsed.bcc, role: MessageParticipantRole.BCC },
    ] as const;

    return addressFields.flatMap(({ field, role }) =>
      formatAddressObjectAsParticipants(this.extractAddresses(field), role),
    );
  }

  private extractAddresses(
    address: Address | Address[] | undefined,
  ): EmailAddress[] {
    if (!address) {
      return [];
    }

    const addresses = Array.isArray(address) ? address : [address];

    const mailboxes = addresses.flatMap((addr) =>
      addr.address ? [addr] : (addr.group ?? []),
    );

    return mailboxes
      .filter((mailbox) => !!mailbox.address)
      .map((mailbox) => ({
        address: mailbox.address as string,
        name: sanitizeString(mailbox.name || ''),
      }));
  }

  private extractOriginWorkspaceId(parsed: ParsedEmail): string | null {
    const headers = (parsed.headers ?? []) as Array<{
      key?: string;
      value?: string;
    }>;

    for (const header of headers) {
      if ((header.key ?? '').toLowerCase() === INBOUND_EMAIL_ORIGIN_HEADER) {
        return (header.value ?? '').trim() || null;
      }
    }

    return null;
  }
}
