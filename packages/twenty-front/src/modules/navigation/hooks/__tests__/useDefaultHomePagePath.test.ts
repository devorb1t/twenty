import { currentUserState } from '@/auth/states/currentUserState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { isMinimalMetadataReadyState } from '@/metadata-store/states/isMinimalMetadataReadyState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { createElement, useEffect, type ReactNode } from 'react';
import { AppPath, NavigationMenuItemType, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  type NavigationMenuItem,
  ViewKey,
  ViewOpenRecordIn,
  ViewType,
  ViewVisibility,
} from '~/generated-metadata/graphql';
import { mockedUserData } from '~/testing/mock-data/users';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';
import { setTestViewsInMetadataStore } from '~/testing/utils/setTestViewsInMetadataStore';

const Wrapper = ({ children }: { children: ReactNode }) =>
  createElement(JotaiProvider, { store: jotaiStore }, children);

const setNavigationMenuItemsInStore = (items: NavigationMenuItem[]) => {
  jotaiStore.set(metadataStoreState.atomFamily('navigationMenuItems'), {
    current: items,
    draft: [],
    status: 'up-to-date',
  });
};

const makeObjectNavItem = (
  overrides: Partial<NavigationMenuItem> & {
    id: string;
    targetObjectMetadataId: string;
    position: number;
  },
): NavigationMenuItem => ({
  type: NavigationMenuItemType.OBJECT as unknown as NavigationMenuItem['type'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const makeViewNavItem = (
  overrides: Partial<NavigationMenuItem> & {
    id: string;
    viewId: string;
    position: number;
  },
): NavigationMenuItem => ({
  type: NavigationMenuItemType.VIEW as unknown as NavigationMenuItem['type'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const companyMetadata = getMockObjectMetadataItemOrThrow('company');
const personMetadata = getMockObjectMetadataItemOrThrow('person');

const setupStore = ({
  withCurrentUser,
  views,
  navigationMenuItems,
}: {
  withCurrentUser: boolean;
  views: Parameters<typeof setTestViewsInMetadataStore>[1];
  navigationMenuItems: NavigationMenuItem[];
}) => {
  setTestObjectMetadataItemsInMetadataStore(
    jotaiStore,
    getTestEnrichedObjectMetadataItemsMock(),
  );

  jotaiStore.set(isMinimalMetadataReadyState.atom, true);

  const { result } = renderHook(
    () => {
      const setCurrentUser = useSetAtomState(currentUserState);
      const setCurrentUserWorkspace = useSetAtomState(
        currentUserWorkspaceState,
      );

      useEffect(() => {
        setTestViewsInMetadataStore(jotaiStore, views);
        setNavigationMenuItemsInStore(navigationMenuItems);

        if (withCurrentUser) {
          setCurrentUser(mockedUserData);
          setCurrentUserWorkspace(mockedUserData.currentUserWorkspace);
        }
      }, [setCurrentUser, setCurrentUserWorkspace]);

      return useDefaultHomePagePath();
    },
    { wrapper: Wrapper },
  );

  return { result };
};

const makeView = (
  id: string,
  objectMetadataId: string,
  overrides?: { key?: ViewKey | null },
) => ({
  id,
  name: 'Test View',
  objectMetadataId,
  type: ViewType.TABLE,
  key: overrides?.key ?? null,
  isCompact: false,
  openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
  viewFields: [],
  viewFieldGroups: [],
  viewGroups: [],
  viewSorts: [],
  viewFilters: [],
  viewFilterGroups: [],
  kanbanAggregateOperation: AggregateOperations.COUNT,
  icon: '',
  kanbanAggregateOperationFieldMetadataId: '',
  position: 0,
  visibility: ViewVisibility.WORKSPACE,
  createdByUserWorkspaceId: null,
  shouldHideEmptyGroups: false,
});

describe('useDefaultHomePagePath', () => {
  it('should return SignInUp when no currentUser', async () => {
    const { result } = setupStore({
      withCurrentUser: false,
      views: [],
      navigationMenuItems: [],
    });

    await waitFor(() => {
      expect(result.current.defaultHomePagePath).toEqual(AppPath.SignInUp);
    });
  });

  it('should return first OBJECT nav item path', async () => {
    const personView = makeView('personViewId', personMetadata.id, {
      key: ViewKey.INDEX,
    });

    const { result } = setupStore({
      withCurrentUser: true,
      views: [personView],
      navigationMenuItems: [
        makeObjectNavItem({
          id: 'nav-person',
          targetObjectMetadataId: personMetadata.id,
          position: 0,
        }),
        makeObjectNavItem({
          id: 'nav-company',
          targetObjectMetadataId: companyMetadata.id,
          position: 1,
        }),
      ],
    });

    await waitFor(() => {
      expect(result.current.defaultHomePagePath).toEqual(
        '/objects/people?viewId=personViewId',
      );
    });
  });

  it('should return first VIEW nav item path', async () => {
    const companyView = makeView('companyViewId', companyMetadata.id);

    const { result } = setupStore({
      withCurrentUser: true,
      views: [companyView],
      navigationMenuItems: [
        makeViewNavItem({
          id: 'nav-view',
          viewId: 'companyViewId',
          position: 0,
        }),
      ],
    });

    await waitFor(() => {
      expect(result.current.defaultHomePagePath).toEqual(
        '/objects/companies?viewId=companyViewId',
      );
    });
  });

  it('should respect position ordering', async () => {
    const companyView = makeView('companyViewId', companyMetadata.id, {
      key: ViewKey.INDEX,
    });
    const personView = makeView('personViewId', personMetadata.id, {
      key: ViewKey.INDEX,
    });

    const { result } = setupStore({
      withCurrentUser: true,
      views: [companyView, personView],
      navigationMenuItems: [
        makeObjectNavItem({
          id: 'nav-company',
          targetObjectMetadataId: companyMetadata.id,
          position: 5,
        }),
        makeObjectNavItem({
          id: 'nav-person',
          targetObjectMetadataId: personMetadata.id,
          position: 1,
        }),
      ],
    });

    await waitFor(() => {
      expect(result.current.defaultHomePagePath).toEqual(
        '/objects/people?viewId=personViewId',
      );
    });
  });

  it('should return Settings profile page when no navigable items', async () => {
    const { result } = setupStore({
      withCurrentUser: true,
      views: [],
      navigationMenuItems: [],
    });

    await waitFor(() => {
      expect(result.current.defaultHomePagePath).toEqual(
        getSettingsPath(SettingsPath.ProfilePage),
      );
    });
  });

  it('should return undefined when metadata is not yet ready', async () => {
    setTestObjectMetadataItemsInMetadataStore(
      jotaiStore,
      getTestEnrichedObjectMetadataItemsMock(),
    );

    jotaiStore.set(isMinimalMetadataReadyState.atom, false);

    const { result } = renderHook(
      () => {
        const setCurrentUser = useSetAtomState(currentUserState);
        const setCurrentUserWorkspace = useSetAtomState(
          currentUserWorkspaceState,
        );

        useEffect(() => {
          setCurrentUser(mockedUserData);
          setCurrentUserWorkspace(mockedUserData.currentUserWorkspace);
        }, [setCurrentUser, setCurrentUserWorkspace]);

        return useDefaultHomePagePath();
      },
      { wrapper: Wrapper },
    );

    await waitFor(() => {
      expect(result.current.defaultHomePagePath).toBeUndefined();
    });
  });

  it('should skip FOLDER and LINK items', async () => {
    const personView = makeView('personViewId', personMetadata.id, {
      key: ViewKey.INDEX,
    });

    const { result } = setupStore({
      withCurrentUser: true,
      views: [personView],
      navigationMenuItems: [
        {
          id: 'nav-folder',
          type: NavigationMenuItemType.FOLDER,
          position: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as NavigationMenuItem,
        {
          id: 'nav-link',
          type: NavigationMenuItemType.LINK,
          position: 1,
          link: 'https://example.com',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as NavigationMenuItem,
        makeObjectNavItem({
          id: 'nav-person',
          targetObjectMetadataId: personMetadata.id,
          position: 2,
        }),
      ],
    });

    await waitFor(() => {
      expect(result.current.defaultHomePagePath).toEqual(
        '/objects/people?viewId=personViewId',
      );
    });
  });
});
