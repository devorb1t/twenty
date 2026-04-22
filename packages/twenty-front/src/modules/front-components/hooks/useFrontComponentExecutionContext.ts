import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import {
  type FrontComponentExecutionContext,
  type FrontComponentHostCommunicationApi,
} from 'twenty-front-component-renderer';
import { type AppPath, type EnqueueSnackbarParams } from 'twenty-shared/types';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useCommandMenuConfirmationModal } from '@/command-menu-item/confirmation-modal/hooks/useCommandMenuConfirmationModal';
import { useUnmountCommand } from '@/command-menu-item/engine-command/hooks/useUnmountEngineCommand';
import { commandMenuItemProgressFamilyState } from '@/command-menu-item/states/commandMenuItemProgressFamilyState';
import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentPageTypeComponentState } from '@/context-store/states/contextStoreCurrentPageTypeComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { useRequestApplicationTokenRefresh } from '@/front-components/hooks/useRequestApplicationTokenRefresh';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useFrontComponentExecutionContext = ({
  frontComponentId,
  commandMenuItemId,
  recordId,
  contextStoreInstanceId,
}: {
  frontComponentId: string;
  commandMenuItemId?: string;
  recordId?: string;
  contextStoreInstanceId?: string;
}): {
  executionContext: FrontComponentExecutionContext;
  frontComponentHostCommunicationApi: FrontComponentHostCommunicationApi;
} => {
  const currentUser = useAtomStateValue(currentUserState);
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const navigateApp = useNavigateApp();
  const { requestAccessTokenRefresh } = useRequestApplicationTokenRefresh({
    frontComponentId,
  });
  const { openConfirmationModal } = useCommandMenuConfirmationModal();
  const { navigateSidePanel } = useNavigateSidePanel();
  const setSidePanelSearch = useSetAtomState(sidePanelSearchState);
  const { getIcon } = useIcons();
  const unmountEngineCommand = useUnmountCommand();
  const {
    enqueueSuccessSnackBar,
    enqueueErrorSnackBar,
    enqueueInfoSnackBar,
    enqueueWarningSnackBar,
  } = useSnackBar();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const setCommandMenuItemProgress = useSetAtomFamilyState(
    commandMenuItemProgressFamilyState,
    commandMenuItemId ?? '',
  );

  const navigate: FrontComponentHostCommunicationApi['navigate'] = async (
    to,
    params,
    queryParams,
    options,
  ) => {
    navigateApp(
      to as AppPath,
      params as Parameters<typeof navigateApp>[1],
      queryParams,
      options,
    );
  };

  const openSidePanelPage: FrontComponentHostCommunicationApi['openSidePanelPage'] =
    async ({ page, pageTitle, pageIcon, shouldResetSearchState }) => {
      navigateSidePanel({
        page,
        pageTitle,
        pageIcon: getIcon(pageIcon),
      });

      if (shouldResetSearchState === true) {
        setSidePanelSearch('');
      }
    };

  const openCommandConfirmationModal: FrontComponentHostCommunicationApi['openCommandConfirmationModal'] =
    async ({ title, subtitle, confirmButtonText, confirmButtonAccent }) => {
      openConfirmationModal({
        caller: { type: 'frontComponent', frontComponentId },
        title,
        subtitle,
        confirmButtonText,
        confirmButtonAccent,
      });
    };

  const enqueueSnackbar: FrontComponentHostCommunicationApi['enqueueSnackbar'] =
    async ({
      message,
      variant,
      duration,
      detailedMessage,
      dedupeKey,
    }: EnqueueSnackbarParams) => {
      const snackBarOptions = {
        duration,
        detailedMessage,
        dedupeKey,
      };

      switch (variant) {
        case 'error':
          enqueueErrorSnackBar({ message, options: snackBarOptions });
          break;
        case 'info':
          enqueueInfoSnackBar({ message, options: snackBarOptions });
          break;
        case 'warning':
          enqueueWarningSnackBar({ message, options: snackBarOptions });
          break;
        case 'success':
          enqueueSuccessSnackBar({ message, options: snackBarOptions });
          break;
        default:
          assertUnreachable(variant);
      }
    };

  const contextStoreCurrentPageType = useAtomComponentStateValue(
    contextStoreCurrentPageTypeComponentState,
    contextStoreInstanceId,
  );
  const contextStoreCurrentViewType = useAtomComponentStateValue(
    contextStoreCurrentViewTypeComponentState,
    contextStoreInstanceId,
  );
  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
    contextStoreInstanceId,
  );
  const contextStoreCurrentObjectMetadataItemId =
    useAtomComponentStateValue(
      contextStoreCurrentObjectMetadataItemIdComponentState,
      contextStoreInstanceId,
    );
  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
    contextStoreInstanceId,
  );
  const contextStoreNumberOfSelectedRecords = useAtomComponentStateValue(
    contextStoreNumberOfSelectedRecordsComponentState,
    contextStoreInstanceId,
  );
  const contextStoreFilters = useAtomComponentStateValue(
    contextStoreFiltersComponentState,
    contextStoreInstanceId,
  );
  const contextStoreFilterGroups = useAtomComponentStateValue(
    contextStoreFilterGroupsComponentState,
    contextStoreInstanceId,
  );
  const contextStoreAnyFieldFilterValue = useAtomComponentStateValue(
    contextStoreAnyFieldFilterValueComponentState,
    contextStoreInstanceId,
  );

  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.id === contextStoreCurrentObjectMetadataItemId,
  );

  const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const userTimezone =
    currentWorkspaceMember?.timeZone !== 'system'
      ? (currentWorkspaceMember?.timeZone ?? systemTimeZone)
      : systemTimeZone;

  const graphqlFilter = isDefined(objectMetadataItem)
    ? (computeContextStoreFilters({
        contextStoreTargetedRecordsRule,
        contextStoreFilters,
        contextStoreFilterGroups,
        objectMetadataItem,
        filterValueDependencies: {
          currentWorkspaceMemberId: currentWorkspaceMember?.id,
          timeZone: userTimezone,
        },
        contextStoreAnyFieldFilterValue,
      }) ?? null)
    : null;

  const executionContext: FrontComponentExecutionContext = {
    frontComponentId,
    userId: currentUser?.id ?? null,
    recordId: recordId ?? null,
    pageType: contextStoreCurrentPageType,
    viewType: contextStoreCurrentViewType,
    viewId: contextStoreCurrentViewId ?? null,
    objectMetadataItemId: contextStoreCurrentObjectMetadataItemId ?? null,
    numberOfSelectedRecords: contextStoreNumberOfSelectedRecords,
    graphqlFilter,
  };

  const unmountFrontComponent: FrontComponentHostCommunicationApi['unmountFrontComponent'] =
    async () => {
      if (isDefined(commandMenuItemId)) {
        unmountEngineCommand(commandMenuItemId);
      }
    };

  const closeSidePanel: FrontComponentHostCommunicationApi['closeSidePanel'] =
    async () => {
      closeSidePanelMenu();
    };

  const updateProgress: FrontComponentHostCommunicationApi['updateProgress'] =
    async (progress) => {
      if (!isDefined(commandMenuItemId)) {
        return;
      }

      setCommandMenuItemProgress(Math.max(0, Math.min(100, progress)));
    };

  const frontComponentHostCommunicationApi: FrontComponentHostCommunicationApi =
    {
      navigate,
      requestAccessTokenRefresh,
      openSidePanelPage,
      openCommandConfirmationModal,
      enqueueSnackbar,
      unmountFrontComponent,
      closeSidePanel,
      updateProgress,
    };

  return {
    executionContext,
    frontComponentHostCommunicationApi,
  };
};
