import { availableWorkspacesState } from '@/auth/states/availableWorkspacesState';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceDeletedMembersState } from '@/auth/states/currentWorkspaceDeletedMembersState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadedState';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { useIsCurrentLocationOnAWorkspace } from '@/domain-manager/hooks/useIsCurrentLocationOnAWorkspace';
import { useLastAuthenticatedWorkspaceDomain } from '@/domain-manager/hooks/useLastAuthenticatedWorkspaceDomain';
import { useInitializeFormatPreferences } from '@/localization/hooks/useInitializeFormatPreferences';
import { getDateFnsLocale } from '@/ui/field/display/utils/getDateFnsLocale';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { workspaceAuthBypassProvidersState } from '@/workspace/states/workspaceAuthBypassProvidersState';
import { useApolloClient } from '@apollo/client/react';
import { enUS } from 'date-fns/locale';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SOURCE_LOCALE, type APP_LOCALES } from 'twenty-shared/translations';
import { type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type ColorScheme } from 'twenty-ui/input';
import { GetCurrentUserDocument } from '~/generated-metadata/graphql';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

export const useLoadCurrentUser = () => {
  const setCurrentUser = useSetAtomState(currentUserState);
  const setAvailableWorkspaces = useSetAtomState(availableWorkspacesState);
  const setCurrentWorkspaceMember = useSetAtomState(
    currentWorkspaceMemberState,
  );
  const { setLastAuthenticateWorkspaceDomain } =
    useLastAuthenticatedWorkspaceDomain();
  const setCurrentUserWorkspace = useSetAtomState(currentUserWorkspaceState);
  const setCurrentWorkspaceMembers = useSetAtomState(
    currentWorkspaceMembersState,
  );
  const setCurrentWorkspaceDeletedMembers = useSetAtomState(
    currentWorkspaceDeletedMembersState,
  );
  const setCurrentWorkspace = useSetAtomState(currentWorkspaceState);
  const setIsCurrentUserLoaded = useSetAtomState(isCurrentUserLoadedState);
  const { initializeFormatPreferences } = useInitializeFormatPreferences();
  const setWorkspaceAuthBypassProviders = useSetAtomState(
    workspaceAuthBypassProvidersState,
  );
  const authProviders = useAtomStateValue(authProvidersState);

  const { isOnAWorkspace } = useIsCurrentLocationOnAWorkspace();

  const client = useApolloClient();
  const store = useStore();

  const loadCurrentUser = useCallback(async () => {
    const currentUserResult = await client.query({
      query: GetCurrentUserDocument,
      fetchPolicy: 'network-only',
    });

    if (isDefined(currentUserResult.error)) {
      throw new Error(currentUserResult.error.message);
    }

    const user = currentUserResult.data?.currentUser;

    if (!isDefined(user)) {
      throw new Error('No current user result');
    }

    let workspaceMember = null;

    setCurrentUser(user);

    if (isDefined(user.workspaceMembers)) {
      setCurrentWorkspaceMembers(user.workspaceMembers);
    }

    if (isDefined(user.availableWorkspaces)) {
      setAvailableWorkspaces(user.availableWorkspaces);
    }

    if (isDefined(user.currentUserWorkspace)) {
      setCurrentUserWorkspace({
        permissionFlags: user.currentUserWorkspace.permissionFlags ?? [],
        twoFactorAuthenticationMethodSummary:
          user.currentUserWorkspace.twoFactorAuthenticationMethodSummary ?? [],
        objectsPermissions:
          (user.currentUserWorkspace.objectsPermissions as Array<
            ObjectPermissions & { objectMetadataId: string }
          >) ?? [],
      });
    }

    if (isDefined(user.deletedWorkspaceMembers)) {
      setCurrentWorkspaceDeletedMembers(user.deletedWorkspaceMembers);
    }

    if (isDefined(user.workspaceMember)) {
      const memberLocale =
        (user.workspaceMember.locale as keyof typeof APP_LOCALES) ??
        SOURCE_LOCALE;

      workspaceMember = {
        ...user.workspaceMember,
        colorScheme:
          (user.workspaceMember.colorScheme as ColorScheme) ?? 'System',
        locale: memberLocale,
      };

      setCurrentWorkspaceMember(workspaceMember);
      initializeFormatPreferences(workspaceMember);
      dynamicActivate(memberLocale);

      const currentLocale = store.get(dateLocaleState.atom);

      if (currentLocale.locale !== memberLocale) {
        getDateFnsLocale(memberLocale).then((localeCatalog) => {
          store.set(dateLocaleState.atom, {
            locale: memberLocale,
            localeCatalog: localeCatalog || enUS,
          });
        });
      }
    }

    const workspace = isDefined(user.currentWorkspace)
      ? {
          ...user.currentWorkspace,
          defaultRole: user.currentWorkspace.defaultRole ?? null,
          workspaceCustomApplication:
            user.currentWorkspace.workspaceCustomApplication ?? null,
        }
      : null;

    setCurrentWorkspace(workspace);

    if (isDefined(workspace)) {
      setWorkspaceAuthBypassProviders({
        google: authProviders.google && workspace.isGoogleAuthBypassEnabled,
        microsoft:
          authProviders.microsoft && workspace.isMicrosoftAuthBypassEnabled,
        password:
          authProviders.password && workspace.isPasswordAuthBypassEnabled,
      });
    }

    if (isDefined(workspace) && isOnAWorkspace) {
      setLastAuthenticateWorkspaceDomain({
        workspaceId: workspace.id,
        workspaceUrl: getWorkspaceUrl(workspace.workspaceUrls),
      });
    }

    setIsCurrentUserLoaded(true);

    return {
      user,
      workspaceMember,
      workspace,
    };
  }, [
    client,
    store,
    setCurrentUser,
    setCurrentWorkspace,
    isOnAWorkspace,
    setCurrentWorkspaceMembers,
    setCurrentWorkspaceDeletedMembers,
    setAvailableWorkspaces,
    setCurrentUserWorkspace,
    setCurrentWorkspaceMember,
    setIsCurrentUserLoaded,
    initializeFormatPreferences,
    setLastAuthenticateWorkspaceDomain,
    authProviders,
    setWorkspaceAuthBypassProviders,
  ]);

  return {
    loadCurrentUser,
  };
};
