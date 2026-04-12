import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from 'jotai';

import { isAppEffectRedirectEnabledState } from '@/app/states/isAppEffectRedirectEnabledState';
import { useAuth } from '@/auth/hooks/useAuth';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { isValidReturnToPath } from '@/auth/utils/isValidReturnToPath';
import { useClearSseClient } from '@/sse-db-event/hooks/useClearSseClient';
import { useLoadCurrentUser } from '@/users/hooks/useLoadCurrentUser';
import { type AuthTokenPair } from '~/generated-metadata/graphql';

const IMPERSONATION_SESSION_KEY = 'impersonation_original_session';

type StoredImpersonationSession = {
  tokenPair: AuthTokenPair;
  returnPath: string;
};

const isValidStoredSession = (
  value: unknown,
): value is StoredImpersonationSession => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  if (typeof candidate.returnPath !== 'string') {
    return false;
  }

  if (typeof candidate.tokenPair !== 'object' || candidate.tokenPair === null) {
    return false;
  }

  const tokenPair = candidate.tokenPair as Record<string, unknown>;
  const accessToken = tokenPair.accessOrWorkspaceAgnosticToken;
  const refreshToken = tokenPair.refreshToken;

  if (
    typeof accessToken !== 'object' ||
    accessToken === null ||
    typeof (accessToken as Record<string, unknown>).token !== 'string'
  ) {
    return false;
  }

  if (
    typeof refreshToken !== 'object' ||
    refreshToken === null ||
    typeof (refreshToken as Record<string, unknown>).token !== 'string'
  ) {
    return false;
  }

  return true;
};

export const useImpersonationSession = () => {
  const store = useStore();
  const client = useApolloClient();
  const navigate = useNavigate();
  const { getAuthTokensFromLoginToken, signOut } = useAuth();
  const { clearSseClient } = useClearSseClient();
  const { loadCurrentUser } = useLoadCurrentUser();

  const startImpersonating = useCallback(
    async (loginToken: string, returnPath?: string) => {
      const currentTokenPair = store.get(tokenPairState.atom);

      if (currentTokenPair) {
        const session: StoredImpersonationSession = {
          tokenPair: currentTokenPair,
          returnPath: returnPath ?? window.location.pathname,
        };
        sessionStorage.setItem(
          IMPERSONATION_SESSION_KEY,
          JSON.stringify(session),
        );
      }

      clearSseClient();
      await client.clearStore();

      store.set(isAppEffectRedirectEnabledState.atom, false);
      await getAuthTokensFromLoginToken(loginToken);
      store.set(isAppEffectRedirectEnabledState.atom, true);
    },
    [store, client, clearSseClient, getAuthTokensFromLoginToken],
  );

  const stopImpersonating = useCallback(async () => {
    const raw = sessionStorage.getItem(IMPERSONATION_SESSION_KEY);

    if (!raw) {
      // No stored session — likely a cross-workspace tab opened via redirect.
      // Try closing the tab (works when opened via window.open or target=_blank).
      window.close();
      // If window.close() was blocked by the browser, fall back to sign out.
      await signOut();
      return;
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(raw);
    } catch {
      sessionStorage.removeItem(IMPERSONATION_SESSION_KEY);
      await signOut();
      return;
    }

    if (!isValidStoredSession(parsed)) {
      sessionStorage.removeItem(IMPERSONATION_SESSION_KEY);
      await signOut();
      return;
    }

    const session = parsed;

    sessionStorage.removeItem(IMPERSONATION_SESSION_KEY);

    clearSseClient();
    await client.clearStore();

    store.set(isAppEffectRedirectEnabledState.atom, false);
    store.set(tokenPairState.atom, session.tokenPair);

    await loadCurrentUser();

    store.set(isAppEffectRedirectEnabledState.atom, true);

    const returnPath = isValidReturnToPath(session.returnPath)
      ? session.returnPath
      : '/';

    navigate(returnPath);
  }, [store, client, clearSseClient, loadCurrentUser, signOut, navigate]);

  const hasStoredSession = useCallback(() => {
    return sessionStorage.getItem(IMPERSONATION_SESSION_KEY) !== null;
  }, []);

  return { startImpersonating, stopImpersonating, hasStoredSession };
};
