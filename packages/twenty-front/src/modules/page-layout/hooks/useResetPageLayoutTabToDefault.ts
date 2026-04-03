import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useInvalidateMetadataStore } from '@/metadata-store/hooks/useInvalidateMetadataStore';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { fieldsWidgetEditorModeDraftComponentState } from '@/page-layout/states/fieldsWidgetEditorModeDraftComponentState';
import { fieldsWidgetEditorModePersistedComponentState } from '@/page-layout/states/fieldsWidgetEditorModePersistedComponentState';
import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetGroupsPersistedComponentState } from '@/page-layout/states/fieldsWidgetGroupsPersistedComponentState';
import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { fieldsWidgetUngroupedFieldsPersistedComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsPersistedComponentState';
import { hasInitializedFieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/hasInitializedFieldsWidgetGroupsDraftComponentState';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { CrudOperationType } from 'twenty-shared/types';
import { ResetPageLayoutTabToDefaultDocument } from '~/generated-metadata/graphql';

export const useResetPageLayoutTabToDefault = (
  pageLayoutIdFromProps?: string,
) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const [resetMutation] = useMutation(ResetPageLayoutTabToDefaultDocument);

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { invalidateMetadataStore } = useInvalidateMetadataStore();

  const store = useStore();

  const hasInitializedState = useAtomComponentStateCallbackState(
    hasInitializedFieldsWidgetGroupsDraftComponentState,
    pageLayoutId,
  );

  const groupsDraftState = useAtomComponentStateCallbackState(
    fieldsWidgetGroupsDraftComponentState,
    pageLayoutId,
  );

  const groupsPersistedState = useAtomComponentStateCallbackState(
    fieldsWidgetGroupsPersistedComponentState,
    pageLayoutId,
  );

  const ungroupedDraftState = useAtomComponentStateCallbackState(
    fieldsWidgetUngroupedFieldsDraftComponentState,
    pageLayoutId,
  );

  const ungroupedPersistedState = useAtomComponentStateCallbackState(
    fieldsWidgetUngroupedFieldsPersistedComponentState,
    pageLayoutId,
  );

  const editorModeDraftState = useAtomComponentStateCallbackState(
    fieldsWidgetEditorModeDraftComponentState,
    pageLayoutId,
  );

  const editorModePersistedState = useAtomComponentStateCallbackState(
    fieldsWidgetEditorModePersistedComponentState,
    pageLayoutId,
  );

  const clearAllWidgetDraftStates = useCallback(() => {
    store.set(hasInitializedState, {});
    store.set(groupsDraftState, {});
    store.set(groupsPersistedState, {});
    store.set(ungroupedDraftState, {});
    store.set(ungroupedPersistedState, {});
    store.set(editorModeDraftState, {});
    store.set(editorModePersistedState, {});
  }, [
    store,
    hasInitializedState,
    groupsDraftState,
    groupsPersistedState,
    ungroupedDraftState,
    ungroupedPersistedState,
    editorModeDraftState,
    editorModePersistedState,
  ]);

  const resetPageLayoutTabToDefault = useCallback(
    async (tabId: string) => {
      try {
        await resetMutation({
          variables: { id: tabId },
        });

        closeSidePanelMenu();
        clearAllWidgetDraftStates();
        invalidateMetadataStore();
      } catch (error) {
        if (CombinedGraphQLErrors.is(error)) {
          handleMetadataError(error, {
            primaryMetadataName: 'pageLayoutTab',
            operationType: CrudOperationType.UPDATE,
          });
        } else {
          enqueueErrorSnackBar({ message: t`An error occurred.` });
        }
      }
    },
    [
      resetMutation,
      closeSidePanelMenu,
      clearAllWidgetDraftStates,
      invalidateMetadataStore,
      handleMetadataError,
      enqueueErrorSnackBar,
    ],
  );

  return { resetPageLayoutTabToDefault };
};
