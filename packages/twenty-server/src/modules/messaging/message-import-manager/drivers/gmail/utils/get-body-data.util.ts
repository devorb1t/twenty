import { type gmail_v1 as gmailV1 } from 'googleapis';

type MessagePart = gmailV1.Schema$MessagePart;

const findPartByMimeType = (
  parts: MessagePart[] | undefined,
  mimeType: string,
): string | null | undefined => {
  if (!parts) {
    return undefined;
  }

  for (const part of parts) {
    if (part.mimeType === mimeType && part.body?.data) {
      return part.body.data;
    }

    const nestedResult = findPartByMimeType(part.parts ?? undefined, mimeType);

    if (nestedResult) {
      return nestedResult;
    }
  }

  return undefined;
};

// Extracts base64-encoded body data from a Gmail API message payload.
// Handles single-part messages, multipart messages at any nesting depth,
// and falls back to text/html when no text/plain part is available.
export const getBodyData = (
  message: gmailV1.Schema$Message,
): { data: string; mimeType: string } | undefined => {
  const payload = message.payload;

  if (!payload) {
    return undefined;
  }

  // Single-part message: body is directly in payload.body
  if (!payload.parts && payload.body?.data) {
    return { data: payload.body.data, mimeType: payload.mimeType ?? '' };
  }

  // Multipart message: recursively search for text/plain first
  const textPlainData = findPartByMimeType(payload.parts ?? undefined, 'text/plain');

  if (textPlainData) {
    return { data: textPlainData, mimeType: 'text/plain' };
  }

  // Fallback to text/html when no text/plain is found
  const textHtmlData = findPartByMimeType(payload.parts ?? undefined, 'text/html');

  if (textHtmlData) {
    return { data: textHtmlData, mimeType: 'text/html' };
  }

  return undefined;
};
