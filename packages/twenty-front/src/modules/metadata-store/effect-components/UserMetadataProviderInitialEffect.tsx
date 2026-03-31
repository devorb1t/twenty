import { useHasAccessTokenPair } from '@/auth/hooks/useHasAccessTokenPair';
import { currentUserState } from '@/auth/states/currentUserState';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadedState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLoadCurrentUser } from '@/users/hooks/useLoadCurrentUser';
import { useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

export const UserMetadataProviderInitialEffect = () => {
  const hasAccessTokenPair = useHasAccessTokenPair();
  const currentUser = useAtomStateValue(currentUserState);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const setIsCurrentUserLoaded = useSetAtomState(isCurrentUserLoadedState);
  const { loadCurrentUser } = useLoadCurrentUser();

  const isLoginFlowInProgress =
    isMatchingLocation(location, AppPath.Verify) &&
    searchParams.has('loginToken');

  useEffect(() => {
    if (isLoginFlowInProgress) {
      return;
    }

    if (!hasAccessTokenPair) {
      setIsCurrentUserLoaded(true);

      return;
    }

    if (isDefined(currentUser)) {
      return;
    }

    loadCurrentUser();
  }, [
    hasAccessTokenPair,
    isLoginFlowInProgress,
    currentUser,
    loadCurrentUser,
    setIsCurrentUserLoaded,
  ]);

  return null;
};
