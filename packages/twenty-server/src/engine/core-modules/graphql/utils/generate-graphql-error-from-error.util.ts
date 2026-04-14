import { HttpException } from '@nestjs/common';

import { type I18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import {
  BaseGraphQLError,
  ErrorCode,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { convertExceptionToGraphQLError } from 'src/engine/utils/global-exception-handler.util';
import { CustomException } from 'src/utils/custom-exception';

export const generateGraphQLErrorFromError = (error: Error, i18n: I18n) => {
  let graphqlError: BaseGraphQLError;

  if (error instanceof HttpException) {
    graphqlError = convertExceptionToGraphQLError(error);
  } else if (error instanceof CustomException) {
    graphqlError = new BaseGraphQLError(
      error,
      ErrorCode.INTERNAL_SERVER_ERROR,
    );
  } else {
    graphqlError = new BaseGraphQLError(
      error.message,
      ErrorCode.INTERNAL_SERVER_ERROR,
    );
  }

  const defaultErrorMessage = msg`An error occurred.`;

  graphqlError.extensions.userFriendlyMessage = i18n._(
    graphqlError.extensions.userFriendlyMessage ?? defaultErrorMessage,
  );

  return graphqlError;
};
