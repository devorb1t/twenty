export const INBOUND_EMAIL_S3_PREFIXES = {
  INCOMING: 'incoming/',
  PROCESSED: 'processed/',
  UNMATCHED: 'unmatched/',
  FAILED: 'failed/',
} as const;

// Header added to outbound messages sent to a group via an email forwarding
// channel. When the forwarding service echoes our own send back as an inbound
// message, we use this header to drop it and avoid a loop.
export const INBOUND_EMAIL_ORIGIN_HEADER = 'x-twenty-origin';

// Prefix used for the opaque local part of the forwarding address.
// The full address is <PREFIX><24 random chars>@<INBOUND_EMAIL_DOMAIN>
export const INBOUND_EMAIL_LOCAL_PART_PREFIX = 'ch_';
