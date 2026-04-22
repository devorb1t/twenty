import { act, renderHook } from '@testing-library/react';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentPageTypeComponentState } from '@/context-store/states/contextStoreCurrentPageTypeComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import {
  contextStoreTargetedRecordsRuleComponentState,
  type ContextStoreTargetedRecordsRule,
} from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useFrontComponentExecutionContext } from '@/front-components/hooks/useFrontComponentExecutionContext';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { ViewFilterOperand } from 'twenty-shared/types';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const mockNavigateApp = jest.fn();
const mockRequestAccessTokenRefresh = jest.fn();
const mockOpenConfirmationModal = jest.fn();
const mockNavigateSidePanel = jest.fn();
const mockSetSidePanelSearch = jest.fn();
const mockGetIcon = jest.fn((name: string) => `icon-${name}`);
const mockUnmountEngineCommand = jest.fn();
const mockEnqueueSuccessSnackBar = jest.fn();
const mockEnqueueErrorSnackBar = jest.fn();
const mockEnqueueInfoSnackBar = jest.fn();
const mockEnqueueWarningSnackBar = jest.fn();
const mockCloseSidePanelMenu = jest.fn();
const mockSetCommandMenuItemProgress = jest.fn();

const enrichedObjectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
const personObjectMetadataItem = enrichedObjectMetadataItems.find(
  (item) => item.nameSingular === 'person',
)!;
const personNameFieldId = personObjectMetadataItem.fields.find(
  (field) => field.name === 'name',
)!.id;

let mockCurrentUser: { id: string } | null = { id: 'user-123' };
let mockCurrentWorkspaceMember:
  | { id: string; timeZone: string }
  | null = { id: 'workspace-member-123', timeZone: 'Europe/Paris' };
let mockObjectMetadataItems = enrichedObjectMetadataItems;

const CONTEXT_STORE_DEFAULTS = new Map<unknown, unknown>([
  [contextStoreCurrentPageTypeComponentState, null],
  [contextStoreCurrentViewTypeComponentState, null],
  [contextStoreCurrentViewIdComponentState, undefined],
  [contextStoreCurrentObjectMetadataItemIdComponentState, undefined],
  [
    contextStoreTargetedRecordsRuleComponentState,
    { mode: 'selection', selectedRecordIds: [] },
  ],
  [contextStoreNumberOfSelectedRecordsComponentState, 0],
  [contextStoreFiltersComponentState, []],
  [contextStoreFilterGroupsComponentState, []],
  [contextStoreAnyFieldFilterValueComponentState, ''],
]);

const contextStoreOverrides = new Map<unknown, unknown>();

const setContextStoreValue = (state: unknown, value: unknown) => {
  contextStoreOverrides.set(state, value);
};

jest.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: () => mockNavigateApp,
}));

jest.mock('@/front-components/hooks/useRequestApplicationTokenRefresh', () => ({
  useRequestApplicationTokenRefresh: () => ({
    requestAccessTokenRefresh: mockRequestAccessTokenRefresh,
  }),
}));

jest.mock(
  '@/command-menu-item/confirmation-modal/hooks/useCommandMenuConfirmationModal',
  () => ({
    useCommandMenuConfirmationModal: () => ({
      openConfirmationModal: mockOpenConfirmationModal,
    }),
  }),
);

jest.mock('@/side-panel/hooks/useNavigateSidePanel', () => ({
  useNavigateSidePanel: () => ({
    navigateSidePanel: mockNavigateSidePanel,
  }),
}));

jest.mock(
  '@/command-menu-item/engine-command/hooks/useUnmountEngineCommand',
  () => ({
    useUnmountCommand: () => mockUnmountEngineCommand,
  }),
);

jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar', () => ({
  useSnackBar: () => ({
    enqueueSuccessSnackBar: mockEnqueueSuccessSnackBar,
    enqueueErrorSnackBar: mockEnqueueErrorSnackBar,
    enqueueInfoSnackBar: mockEnqueueInfoSnackBar,
    enqueueWarningSnackBar: mockEnqueueWarningSnackBar,
  }),
}));

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({
    closeSidePanelMenu: mockCloseSidePanelMenu,
  }),
}));

jest.mock('twenty-ui/display', () => ({
  useIcons: () => ({
    getIcon: mockGetIcon,
  }),
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: (atom: unknown) => {
    if (atom === currentUserState) {
      return mockCurrentUser;
    }
    if (atom === currentWorkspaceMemberState) {
      return mockCurrentWorkspaceMember;
    }
    if (atom === objectMetadataItemsSelector) {
      return mockObjectMetadataItems;
    }
    return undefined;
  },
}));

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: (componentState: unknown) =>
      contextStoreOverrides.has(componentState)
        ? contextStoreOverrides.get(componentState)
        : CONTEXT_STORE_DEFAULTS.get(componentState),
  }),
);

jest.mock('@/ui/utilities/state/jotai/hooks/useSetAtomState', () => ({
  useSetAtomState: () => mockSetSidePanelSearch,
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState', () => ({
  useSetAtomFamilyState: () => mockSetCommandMenuItemProgress,
}));

const FRONT_COMPONENT_ID = 'fc-test-id';
const COMMAND_MENU_ITEM_ID = 'cmd-item-1';

describe('useFrontComponentExecutionContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentUser = { id: 'user-123' };
    mockCurrentWorkspaceMember = {
      id: 'workspace-member-123',
      timeZone: 'Europe/Paris',
    };
    mockObjectMetadataItems = enrichedObjectMetadataItems;
    contextStoreOverrides.clear();
  });

  describe('executionContext', () => {
    it('should return frontComponentId, userId, and recordId', () => {
      const { result } = renderHook(() =>
        useFrontComponentExecutionContext({
          frontComponentId: FRONT_COMPONENT_ID,
          recordId: 'record-456',
        }),
      );

      expect(result.current.executionContext).toEqual({
        frontComponentId: FRONT_COMPONENT_ID,
        userId: 'user-123',
        recordId: 'record-456',
        pageType: null,
        viewType: null,
        viewId: null,
        objectMetadataItemId: null,
        numberOfSelectedRecords: 0,
        graphqlFilter: null,
      });
    });

    it('should return null userId when no current user', () => {
      mockCurrentUser = null;

      const { result } = renderHook(() =>
        useFrontComponentExecutionContext({
          frontComponentId: FRONT_COMPONENT_ID,
        }),
      );

      expect(result.current.executionContext.userId).toBeNull();
    });

    it('should return null recordId when no recordId provided', () => {
      const { result } = renderHook(() =>
        useFrontComponentExecutionContext({
          frontComponentId: FRONT_COMPONENT_ID,
        }),
      );

      expect(result.current.executionContext.recordId).toBeNull();
    });
  });

  describe('graphqlFilter', () => {
    it('should be null when objectMetadataItem cannot be resolved', () => {
      setContextStoreValue(
        contextStoreCurrentObjectMetadataItemIdComponentState,
        'unknown-object-id',
      );
      const { result } = renderHook(() =>
        useFrontComponentExecutionContext({
          frontComponentId: FRONT_COMPONENT_ID,
        }),
      );

      expect(result.current.executionContext.graphqlFilter).toBeNull();
    });

    it('should return { id: { in: [] } } for empty selection mode', () => {
      setContextStoreValue(
        contextStoreCurrentObjectMetadataItemIdComponentState,
        personObjectMetadataItem.id,
      );
      const targetedRecordsRule: ContextStoreTargetedRecordsRule = {
        mode: 'selection',
        selectedRecordIds: [],
      };
      setContextStoreValue(
        contextStoreTargetedRecordsRuleComponentState,
        targetedRecordsRule,
      );

      const { result } = renderHook(() =>
        useFrontComponentExecutionContext({
          frontComponentId: FRONT_COMPONENT_ID,
        }),
      );

      expect(result.current.executionContext.graphqlFilter).toEqual({
        id: { in: [] },
      });
    });

    it('should compose selection mode with selected record ids', () => {
      setContextStoreValue(
        contextStoreCurrentObjectMetadataItemIdComponentState,
        personObjectMetadataItem.id,
      );
      const targetedRecordsRule: ContextStoreTargetedRecordsRule = {
        mode: 'selection',
        selectedRecordIds: ['1', '2', '3'],
      };
      setContextStoreValue(
        contextStoreTargetedRecordsRuleComponentState,
        targetedRecordsRule,
      );

      const { result } = renderHook(() =>
        useFrontComponentExecutionContext({
          frontComponentId: FRONT_COMPONENT_ID,
        }),
      );

      expect(result.current.executionContext.graphqlFilter).toEqual({
        and: [{}, { id: { in: ['1', '2', '3'] } }, {}],
      });
    });

    it('should compose exclusion mode with raw filters', () => {
      setContextStoreValue(
        contextStoreCurrentObjectMetadataItemIdComponentState,
        personObjectMetadataItem.id,
      );
      const targetedRecordsRule: ContextStoreTargetedRecordsRule = {
        mode: 'exclusion',
        excludedRecordIds: ['1', '2', '3'],
      };
      setContextStoreValue(
        contextStoreTargetedRecordsRuleComponentState,
        targetedRecordsRule,
      );
      const filters: RecordFilter[] = [
        {
          id: 'name-filter',
          fieldMetadataId: personNameFieldId,
          value: 'John',
          displayValue: 'John',
          displayAvatarUrl: undefined,
          operand: ViewFilterOperand.CONTAINS,
          type: 'TEXT',
          label: 'Name',
        },
      ];
      setContextStoreValue(contextStoreFiltersComponentState, filters);

      const { result } = renderHook(() =>
        useFrontComponentExecutionContext({
          frontComponentId: FRONT_COMPONENT_ID,
        }),
      );

      expect(result.current.executionContext.graphqlFilter).toEqual({
        and: [
          {},
          {
            or: [
              { name: { firstName: { ilike: '%John%' } } },
              { name: { lastName: { ilike: '%John%' } } },
            ],
          },
          { not: { id: { in: ['1', '2', '3'] } } },
        ],
      });
    });
  });

  describe('navigate', () => {
    it('should call navigateApp with the provided arguments', async () => {
      const { result } = renderHook(() =>
        useFrontComponentExecutionContext({
          frontComponentId: FRONT_COMPONENT_ID,
        }),
      );

      await act(async () => {
        await result.current.frontComponentHostCommunicationApi.navigate(
          '/settings' as never,
          { id: '1' } as never,
          { tab: 'general' } as never,
          { replace: true } as never,
        );
      });

      expect(mockNavigateApp).toHaveBeenCalledWith(
        '/settings',
        { id: '1' },
        { tab: 'general' },
        { replace: true },
      );
    });
  });

  describe('openSidePanelPage', () => {
    it('should call navigateSidePanel with resolved icon', async () => {
      const { result } = renderHook(() =>
        useFrontComponentExecutionContext({
          frontComponentId: FRONT_COMPONENT_ID,
        }),
      );

      await act(async () => {
        await result.current.frontComponentHostCommunicationApi.openSidePanelPage(
          {
            page: '/side-panel-page' as never,
            pageTitle: 'My Page',
            pageIcon: 'IconSettings',
            shouldResetSearchState: false,
          },
        );
      });

      expect(mockNavigateSidePanel).toHaveBeenCalledWith({
        page: '/side-panel-page',
        pageTitle: 'My Page',
        pageIcon: 'icon-IconSettings',
      });

      expect(mockSetSidePanelSearch).not.toHaveBeenCalled();
    });

    it('should reset side panel search state when shouldResetSearchState is true', async () => {
      const { result } = renderHook(() =>
        useFrontComponentExecutionContext({
          frontComponentId: FRONT_COMPONENT_ID,
        }),
      );

      await act(async () => {
        await result.current.frontComponentHostCommunicationApi.openSidePanelPage(
          {
            page: '/page' as never,
            pageTitle: 'Title',
            pageIcon: 'IconSearch',
            shouldResetSearchState: true,
          },
        );
      });

      expect(mockSetSidePanelSearch).toHaveBeenCalledWith('');
    });
  });

  describe('openCommandConfirmationModal', () => {
    it('should call openConfirmationModal with frontComponent caller', async () => {
      const { result } = renderHook(() =>
        useFrontComponentExecutionContext({
          frontComponentId: FRONT_COMPONENT_ID,
        }),
      );

      await act(async () => {
        await result.current.frontComponentHostCommunicationApi.openCommandConfirmationModal(
          {
            title: 'Confirm?',
            subtitle: 'Are you sure?',
            confirmButtonText: 'Yes',
            confirmButtonAccent: 'danger' as never,
          },
        );
      });

      expect(mockOpenConfirmationModal).toHaveBeenCalledWith({
        caller: {
          type: 'frontComponent',
          frontComponentId: FRONT_COMPONENT_ID,
        },
        title: 'Confirm?',
        subtitle: 'Are you sure?',
        confirmButtonText: 'Yes',
        confirmButtonAccent: 'danger',
      });
    });
  });

  describe('enqueueSnackbar', () => {
    it.each([
      { variant: 'success' as const, mock: () => mockEnqueueSuccessSnackBar },
      { variant: 'error' as const, mock: () => mockEnqueueErrorSnackBar },
      { variant: 'info' as const, mock: () => mockEnqueueInfoSnackBar },
      { variant: 'warning' as const, mock: () => mockEnqueueWarningSnackBar },
    ])(
      'should route $variant snackbar to the correct handler',
      async ({ variant, mock }) => {
        const { result } = renderHook(() =>
          useFrontComponentExecutionContext({
            frontComponentId: FRONT_COMPONENT_ID,
          }),
        );

        await act(async () => {
          await result.current.frontComponentHostCommunicationApi.enqueueSnackbar(
            {
              message: `${variant} message`,
              variant,
              duration: 3000,
              detailedMessage: 'details',
              dedupeKey: 'key-1',
            },
          );
        });

        expect(mock()).toHaveBeenCalledWith({
          message: `${variant} message`,
          options: {
            duration: 3000,
            detailedMessage: 'details',
            dedupeKey: 'key-1',
          },
        });
      },
    );
  });

  describe('unmountFrontComponent', () => {
    it('should call unmountEngineCommand when commandMenuItemId is provided', async () => {
      const { result } = renderHook(() =>
        useFrontComponentExecutionContext({
          frontComponentId: FRONT_COMPONENT_ID,
          commandMenuItemId: COMMAND_MENU_ITEM_ID,
        }),
      );

      await act(async () => {
        await result.current.frontComponentHostCommunicationApi.unmountFrontComponent();
      });

      expect(mockUnmountEngineCommand).toHaveBeenCalledWith(
        COMMAND_MENU_ITEM_ID,
      );
    });

    it('should not call unmountEngineCommand when commandMenuItemId is undefined', async () => {
      const { result } = renderHook(() =>
        useFrontComponentExecutionContext({
          frontComponentId: FRONT_COMPONENT_ID,
        }),
      );

      await act(async () => {
        await result.current.frontComponentHostCommunicationApi.unmountFrontComponent();
      });

      expect(mockUnmountEngineCommand).not.toHaveBeenCalled();
    });
  });

  describe('closeSidePanel', () => {
    it('should call closeSidePanelMenu', async () => {
      const { result } = renderHook(() =>
        useFrontComponentExecutionContext({
          frontComponentId: FRONT_COMPONENT_ID,
        }),
      );

      await act(async () => {
        await result.current.frontComponentHostCommunicationApi.closeSidePanel();
      });

      expect(mockCloseSidePanelMenu).toHaveBeenCalled();
    });
  });

  describe('updateProgress', () => {
    it('should set clamped progress when commandMenuItemId is provided', async () => {
      const { result } = renderHook(() =>
        useFrontComponentExecutionContext({
          frontComponentId: FRONT_COMPONENT_ID,
          commandMenuItemId: COMMAND_MENU_ITEM_ID,
        }),
      );

      await act(async () => {
        await result.current.frontComponentHostCommunicationApi.updateProgress(
          50,
        );
      });

      expect(mockSetCommandMenuItemProgress).toHaveBeenCalledWith(50);
    });

    it('should clamp progress to 0 when negative value is provided', async () => {
      const { result } = renderHook(() =>
        useFrontComponentExecutionContext({
          frontComponentId: FRONT_COMPONENT_ID,
          commandMenuItemId: COMMAND_MENU_ITEM_ID,
        }),
      );

      await act(async () => {
        await result.current.frontComponentHostCommunicationApi.updateProgress(
          -10,
        );
      });

      expect(mockSetCommandMenuItemProgress).toHaveBeenCalledWith(0);
    });

    it('should clamp progress to 100 when value exceeds 100', async () => {
      const { result } = renderHook(() =>
        useFrontComponentExecutionContext({
          frontComponentId: FRONT_COMPONENT_ID,
          commandMenuItemId: COMMAND_MENU_ITEM_ID,
        }),
      );

      await act(async () => {
        await result.current.frontComponentHostCommunicationApi.updateProgress(
          150,
        );
      });

      expect(mockSetCommandMenuItemProgress).toHaveBeenCalledWith(100);
    });
  });
});
