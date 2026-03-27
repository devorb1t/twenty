import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { isDefined } from 'twenty-shared/utils';

const isNetworkError = (error: {
  statusCode: number;
  message?: string;
}): boolean => {
  if (error instanceof TypeError) {
    return true;
  }

  if (isDefined(error.statusCode)) {
    return false;
  }

  const cause = (error as unknown as { cause?: { code?: string } })?.cause;

  if (!isDefined(cause) || !isDefined(cause.code)) {
    return false;
  }

  const networkErrorCodes = [
    'ECONNRESET',
    'ENOTFOUND',
    'ECONNABORTED',
    'ETIMEDOUT',
    'ECONNREFUSED',
    'EHOSTUNREACH',
    'ERR_NETWORK',
    'UND_ERR_CONNECT_TIMEOUT',
    'UND_ERR_SOCKET',
  ];

  return networkErrorCodes.includes(cause.code);
};

export const parseMicrosoftMessagesImportError = (
  error: {
    statusCode: number;
    message?: string;
    code?: string;
  },
  options?: { cause?: Error },
): MessageImportDriverException => {
  if (isNetworkError(error)) {
    return new MessageImportDriverException(
      `Microsoft Graph API network error: ${error.message}`,
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      { cause: options?.cause },
    );
  }

  if (error.statusCode === 400) {
    if (!isDefined(error.message)) {
      return new MessageImportDriverException(
        `Microsoft Graph API returned 400 with empty error body`,
        MessageImportDriverExceptionCode.TEMPORARY_ERROR,
        { cause: options?.cause },
      );
    }

    return new MessageImportDriverException(
      `Invalid request to Microsoft Graph API: ${error.message}`,
      MessageImportDriverExceptionCode.UNKNOWN,
      { cause: options?.cause },
    );
  }

  if (error.statusCode === 401) {
    return new MessageImportDriverException(
      'Unauthorized access to Microsoft Graph API',
      MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      { cause: options?.cause },
    );
  }

  if (error.statusCode === 403) {
    return new MessageImportDriverException(
      'Forbidden access to Microsoft Graph API',
      MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      { cause: options?.cause },
    );
  }

  if (error.statusCode === 404) {
    if (
      error.message?.includes(
        'The mailbox is either inactive, soft-deleted, or is hosted on-premise.',
      )
    ) {
      return new MessageImportDriverException(
        `Disabled, deleted, inactive or no licence Microsoft account - code:${error.code}`,
        MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
        { cause: options?.cause },
      );
    } else {
      return new MessageImportDriverException(
        `Not found - code:${error.code}`,
        MessageImportDriverExceptionCode.NOT_FOUND,
        { cause: options?.cause },
      );
    }
  }

  if (error.statusCode === 410) {
    return new MessageImportDriverException(
      `Sync cursor error: ${error.message}`,
      MessageImportDriverExceptionCode.SYNC_CURSOR_ERROR,
      { cause: options?.cause },
    );
  }

  if (
    error.statusCode === 429 ||
    error.statusCode === 500 ||
    error.statusCode === 502 ||
    error.statusCode === 503 ||
    error.statusCode === 504 ||
    error.statusCode === 509
  ) {
    return new MessageImportDriverException(
      `Microsoft Graph API ${error.code} ${error.statusCode} error: ${error.message}`,
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      { cause: options?.cause },
    );
  }

  return new MessageImportDriverException(
    `Microsoft Graph API unknown error: ${error} with status code ${error.statusCode}`,
    MessageImportDriverExceptionCode.UNKNOWN,
    { cause: options?.cause },
  );
};
