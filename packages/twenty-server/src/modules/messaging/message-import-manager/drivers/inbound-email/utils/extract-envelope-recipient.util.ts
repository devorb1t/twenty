import { type Email as ParsedEmail } from 'postal-mime';

// Best-effort extraction of the envelope recipient (the address the message
// was actually delivered to, as opposed to what appears in To/Cc). SES writes
// the envelope recipient into the Received header's "for" clause, so we check
// that first and fall back to scanning To/Cc/Delivered-To/X-Original-To for
// anything at the given domain.
export const extractEnvelopeRecipientForDomain = (
  parsed: ParsedEmail,
  domain: string,
): string | null => {
  const normalizedDomain = domain.trim().toLowerCase();

  if (!normalizedDomain) {
    return null;
  }

  const candidates: string[] = [];

  const headers = (parsed.headers ?? []) as Array<{
    key?: string;
    value?: string;
  }>;

  for (const header of headers) {
    const key = (header.key ?? '').toLowerCase();

    if (!header.value) {
      continue;
    }

    if (key === 'received') {
      const match = /\bfor\s+<?([^\s<>;]+)>?/i.exec(header.value);

      if (match?.[1]) {
        candidates.push(match[1]);
      }
    }

    if (key === 'delivered-to' || key === 'x-original-to') {
      candidates.push(header.value);
    }
  }

  const addressFields = [parsed.to, parsed.cc, parsed.bcc];

  for (const field of addressFields) {
    if (!field) continue;

    const list = Array.isArray(field) ? field : [field];

    for (const entry of list) {
      if (entry.address) {
        candidates.push(entry.address);
      }

      if (Array.isArray(entry.group)) {
        for (const groupEntry of entry.group) {
          if (groupEntry.address) {
            candidates.push(groupEntry.address);
          }
        }
      }
    }
  }

  for (const candidate of candidates) {
    const normalized = candidate.trim().toLowerCase();

    if (normalized.endsWith(`@${normalizedDomain}`)) {
      return normalized;
    }
  }

  return null;
};

export const extractLocalPart = (address: string): string => {
  const atIndex = address.indexOf('@');

  return atIndex === -1 ? address : address.slice(0, atIndex);
};
