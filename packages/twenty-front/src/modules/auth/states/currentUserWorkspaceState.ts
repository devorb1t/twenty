import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type ObjectPermissions } from 'twenty-shared/types';
import { type UserWorkspace } from '~/generated-metadata/graphql';

export type CurrentUserWorkspace = Pick<
  UserWorkspace,
  'id' | 'permissionFlags' | 'twoFactorAuthenticationMethodSummary'
> & {
  objectsPermissions: Array<ObjectPermissions & { objectMetadataId: string }>;
};

export const currentUserWorkspaceState =
  createAtomState<CurrentUserWorkspace | null>({
    key: 'currentUserWorkspaceState',
    defaultValue: null,
  });
