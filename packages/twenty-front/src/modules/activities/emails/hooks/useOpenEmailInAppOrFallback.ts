import { useCallback } from 'react';

import { useFirstConnectedAccount } from '@/activities/emails/hooks/useFirstConnectedAccount';
import { useOpenComposeEmailInSidePanel } from '@/side-panel/hooks/useOpenComposeEmailInSidePanel';
import { isDefined } from 'twenty-shared/utils';

type UseOpenEmailInAppOrFallbackOptions = {
  // When true the underlying connected-account query is skipped entirely,
  // avoiding an unnecessary network request for non-email field types or when
  // the click action is not OPEN_IN_APP.
  skip?: boolean;
};

// Opens the in-app email composer for the given email address. When the user
// has no connected account we cannot send through the side panel, so we fall
// back to the OS-level mailto handler instead of redirecting to settings —
// the user explicitly opted into "Open in app" and the link is still useful.
export const useOpenEmailInAppOrFallback = (
  options?: UseOpenEmailInAppOrFallbackOptions,
) => {
  const { connectedAccountId, loading } = useFirstConnectedAccount({
    skip: options?.skip,
  });
  const { openComposeEmailInSidePanel } = useOpenComposeEmailInSidePanel();

  const openEmail = useCallback(
    (email: string) => {
      if (isDefined(connectedAccountId)) {
        openComposeEmailInSidePanel({
          connectedAccountId,
          defaultTo: email,
        });

        return;
      }

      window.open(`mailto:${email}`, '_blank');
    },
    [connectedAccountId, openComposeEmailInSidePanel],
  );

  return { openEmail, loading };
};
