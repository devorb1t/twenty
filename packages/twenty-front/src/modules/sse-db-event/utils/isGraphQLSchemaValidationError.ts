import { type GraphQLError } from 'graphql';

// GraphQL validation errors like "Cannot query field" or "Unknown type"
// in SSE subscription responses indicate a stale frontend with an outdated
// schema. These occur when the server schema changes (e.g. type renames)
// and the user's browser is still running cached JS from before the upgrade.
export const isGraphQLSchemaValidationError = (
  error: GraphQLError,
): boolean => {
  const message = error.message ?? '';

  return (
    message.startsWith('Cannot query field') ||
    message.startsWith('Unknown type')
  );
};
