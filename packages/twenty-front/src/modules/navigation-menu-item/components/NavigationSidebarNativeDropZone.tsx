import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { type ReactNode, useEffect, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconFolder, IconLink, useIcons } from 'twenty-ui/display';

import { ADD_TO_NAVIGATION_DRAG } from '@/navigation-menu-item/constants/AddToNavigationDrag.constants';
import { NavigationDropTargetContext } from '@/navigation-menu-item/contexts/NavigationDropTargetContext';
import { useAddToNavigationMenuDraft } from '@/navigation-menu-item/hooks/useAddToNavigationMenuDraft';
import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/hooks/useNavigationMenuItemsDraftState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { useOpenNavigationMenuItemInCommandMenu } from '@/navigation-menu-item/hooks/useOpenNavigationMenuItemInCommandMenu';
import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/states/isNavigationMenuInEditModeState';
import { openNavigationMenuItemFolderIdsState } from '@/navigation-menu-item/states/openNavigationMenuItemFolderIdsState';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { type AddToNavigationDragPayload } from '@/navigation-menu-item/types/add-to-navigation-drag-payload';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { coreViewsState } from '@/views/states/coreViewState';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';

const DROP_TARGET_ATTR = 'data-navigation-drop-target';
const DROP_FOLDER_ATTR = 'data-navigation-drop-folder';
const DROP_INDEX_ATTR = 'data-navigation-drop-index';
const DROP_ZONE_ATTR = 'data-navigation-drop-zone';

const StyledDropZone = styled.div`
  height: 100%;
  min-height: 0;
`;

type NavigationSidebarNativeDropZoneProps = {
  children: ReactNode;
};

export const NavigationSidebarNativeDropZone = ({
  children,
}: NavigationSidebarNativeDropZoneProps) => {
  const [activeDropTargetId, setActiveDropTargetId] = useState<string | null>(
    null,
  );
  const [forbiddenDropTargetId, setForbiddenDropTargetId] = useState<
    string | null
  >(null);
  const {
    addFolderToDraftAtPosition,
    addLinkToDraftAtPosition,
    addObjectToDraftAtPosition,
    addViewToDraftAtPosition,
    addRecordToDraftAtPosition,
  } = useAddToNavigationMenuDraft();
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsDraftState();
  const navigationMenuItemsDraft = useRecoilValue(
    navigationMenuItemsDraftState,
  );
  const { openNavigationMenuItemInCommandMenu } =
    useOpenNavigationMenuItemInCommandMenu();
  const { objectMetadataItems } = useObjectMetadataItems();
  const coreViews = useRecoilValue(coreViewsState);
  const { getIcon } = useIcons();
  const setSelectedNavigationMenuItemInEditMode = useSetRecoilState(
    selectedNavigationMenuItemInEditModeState,
  );
  const setIsNavigationMenuInEditMode = useSetRecoilState(
    isNavigationMenuInEditModeState,
  );
  const setOpenNavigationMenuItemFolderIds = useSetRecoilState(
    openNavigationMenuItemFolderIdsState,
  );

  const currentDraft = isDefined(navigationMenuItemsDraft)
    ? navigationMenuItemsDraft
    : workspaceNavigationMenuItems;

  const processDrop = (event: DragEvent, data: string) => {
    let payload: AddToNavigationDragPayload;
    try {
      payload = JSON.parse(data) as AddToNavigationDragPayload;
    } catch {
      return;
    }

    const element = document.elementFromPoint(
      event.clientX,
      event.clientY,
    ) as HTMLElement | null;
    const dropTargetElement = element?.closest(`[${DROP_TARGET_ATTR}]`);

    let folderId: string | null = null;
    let index = 0;

    if (isDefined(dropTargetElement)) {
      const folderAttr = dropTargetElement.getAttribute(DROP_FOLDER_ATTR);
      const indexAttr = dropTargetElement.getAttribute(DROP_INDEX_ATTR);
      folderId = folderAttr === 'orphan' ? null : folderAttr;
      index = indexAttr ? parseInt(indexAttr, 10) : 0;
    }

    if (payload.type === 'folder' && folderId !== null) {
      return;
    }

    if (isDefined(dropTargetElement) && folderId !== null) {
      const folderToOpen = folderId;
      setOpenNavigationMenuItemFolderIds((current) =>
        current.includes(folderToOpen) ? current : [...current, folderToOpen],
      );
    }

    if (!isDefined(dropTargetElement)) {
      const itemsInFolder = currentDraft.filter(
        (item) => (item.folderId ?? null) === null,
      );
      index = itemsInFolder.length;
    }

    switch (payload.type) {
      case 'folder': {
        const newFolderId = addFolderToDraftAtPosition(
          payload.name,
          currentDraft,
          null,
          index,
        );
        setIsNavigationMenuInEditMode(true);
        setSelectedNavigationMenuItemInEditMode(newFolderId);
        openNavigationMenuItemInCommandMenu({
          pageTitle: t`Edit folder`,
          pageIcon: IconFolder,
          focusTitleInput: true,
        });
        return;
      }
      case 'link': {
        const newLinkId = addLinkToDraftAtPosition(
          payload.name || t`Link label`,
          payload.link,
          currentDraft,
          folderId,
          index,
        );
        setIsNavigationMenuInEditMode(true);
        setSelectedNavigationMenuItemInEditMode(newLinkId);
        openNavigationMenuItemInCommandMenu({
          pageTitle: t`Edit link`,
          pageIcon: IconLink,
          focusTitleInput: true,
        });
        return;
      }
      case 'object': {
        const newItemId = addObjectToDraftAtPosition(
          payload.objectMetadataId,
          payload.defaultViewId,
          currentDraft,
          folderId,
          index,
        );
        setIsNavigationMenuInEditMode(true);
        setSelectedNavigationMenuItemInEditMode(newItemId);
        const objectMetadataItem = objectMetadataItems.find(
          (item) => item.id === payload.objectMetadataId,
        );
        openNavigationMenuItemInCommandMenu({
          pageTitle: objectMetadataItem?.labelPlural ?? payload.label,
          pageIcon: objectMetadataItem
            ? getIcon(objectMetadataItem.icon)
            : IconFolder,
        });
        return;
      }
      case 'view': {
        const newItemId = addViewToDraftAtPosition(
          payload.viewId,
          currentDraft,
          folderId,
          index,
        );
        setIsNavigationMenuInEditMode(true);
        setSelectedNavigationMenuItemInEditMode(newItemId);
        const views = coreViews.map(convertCoreViewToView);
        const view = views.find((v) => v.id === payload.viewId);
        openNavigationMenuItemInCommandMenu({
          pageTitle: view?.name ?? payload.label,
          pageIcon: view ? getIcon(view.icon) : IconFolder,
        });
        return;
      }
      case 'record': {
        const newItemId = addRecordToDraftAtPosition(
          {
            recordId: payload.recordId,
            objectMetadataId: payload.objectMetadataId,
            objectNameSingular: payload.objectNameSingular,
            label: payload.label,
            imageUrl: payload.imageUrl,
          },
          currentDraft,
          folderId,
          index,
        );
        setIsNavigationMenuInEditMode(true);
        setSelectedNavigationMenuItemInEditMode(newItemId);
        const objectMetadataItem = objectMetadataItems.find(
          (item) => item.id === payload.objectMetadataId,
        );
        openNavigationMenuItemInCommandMenu({
          pageTitle: payload.label,
          pageIcon: objectMetadataItem
            ? getIcon(objectMetadataItem.icon)
            : IconFolder,
        });
        return;
      }
    }
  };

  useEffect(() => {
    const handleDocumentDrop = (event: DragEvent) => {
      if (!event.dataTransfer?.types.includes(ADD_TO_NAVIGATION_DRAG.TYPE)) {
        return;
      }

      const data = event.dataTransfer.getData(ADD_TO_NAVIGATION_DRAG.TYPE);
      if (!data) return;

      const element = document.elementFromPoint(
        event.clientX,
        event.clientY,
      ) as HTMLElement | null;
      const isDropInSidebar = element?.closest(`[${DROP_ZONE_ATTR}]`);

      if (!isDropInSidebar) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      processDrop(event, data);
      setActiveDropTargetId(null);
      setForbiddenDropTargetId(null);
    };

    const handleDocumentDragOver = (event: DragEvent) => {
      if (!event.dataTransfer?.types.includes(ADD_TO_NAVIGATION_DRAG.TYPE)) {
        return;
      }

      const element = document.elementFromPoint(
        event.clientX,
        event.clientY,
      ) as HTMLElement | null;
      const isOverSidebar = element?.closest(`[${DROP_ZONE_ATTR}]`);
      const dropTargetElement = element?.closest(`[${DROP_TARGET_ATTR}]`);
      const isFolderOverFolder =
        event.dataTransfer.types.includes(ADD_TO_NAVIGATION_DRAG.FOLDER_TYPE) &&
        isDefined(dropTargetElement) &&
        dropTargetElement.getAttribute(DROP_FOLDER_ATTR) !== 'orphan';

      if (isDefined(isOverSidebar)) {
        event.preventDefault();
        event.dataTransfer.dropEffect = isFolderOverFolder ? 'none' : 'copy';
      }
    };

    document.addEventListener('drop', handleDocumentDrop, true);
    document.addEventListener('dragover', handleDocumentDragOver, true);

    return () => {
      document.removeEventListener('drop', handleDocumentDrop, true);
      document.removeEventListener('dragover', handleDocumentDragOver, true);
    };
    // processDrop is intentionally excluded - it captures current draft/state and
    // must not be memoized per project conventions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentDraft,
    addFolderToDraftAtPosition,
    addLinkToDraftAtPosition,
    addObjectToDraftAtPosition,
    addViewToDraftAtPosition,
    addRecordToDraftAtPosition,
    openNavigationMenuItemInCommandMenu,
    objectMetadataItems,
    coreViews,
    getIcon,
    setSelectedNavigationMenuItemInEditMode,
    setIsNavigationMenuInEditMode,
    setOpenNavigationMenuItemFolderIds,
  ]);

  const handleDragOverOrEnter = (event: React.DragEvent) => {
    if (event.dataTransfer.types.includes(ADD_TO_NAVIGATION_DRAG.TYPE)) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    const data = event.dataTransfer.getData(ADD_TO_NAVIGATION_DRAG.TYPE);
    if (!data) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    processDrop(event.nativeEvent, data);
    setActiveDropTargetId(null);
    setForbiddenDropTargetId(null);
  };

  return (
    <NavigationDropTargetContext.Provider
      value={{
        activeDropTargetId,
        setActiveDropTargetId,
        forbiddenDropTargetId,
        setForbiddenDropTargetId,
      }}
    >
      <StyledDropZone
        data-navigation-drop-zone=""
        onDragOver={handleDragOverOrEnter}
        onDragEnter={handleDragOverOrEnter}
        onDrop={handleDrop}
      >
        {children}
      </StyledDropZone>
    </NavigationDropTargetContext.Provider>
  );
};
