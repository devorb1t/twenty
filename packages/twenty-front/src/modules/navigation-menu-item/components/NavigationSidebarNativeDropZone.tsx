import { type ReactNode, useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconFolder, IconLink, useIcons } from 'twenty-ui/display';

import { ADD_TO_NAVIGATION_DRAG_TYPE } from '@/navigation-menu-item/constants/AddToNavigationDrag.constants';
import { useAddToNavigationMenuDraft } from '@/navigation-menu-item/hooks/useAddToNavigationMenuDraft';
import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/hooks/useNavigationMenuItemsDraftState';
import { useOpenNavigationMenuItemInCommandMenu } from '@/navigation-menu-item/hooks/useOpenNavigationMenuItemInCommandMenu';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/states/isNavigationMenuInEditModeState';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { type AddToNavigationDragPayload } from '@/navigation-menu-item/types/add-to-navigation-drag-payload';
import { coreViewsState } from '@/views/states/coreViewState';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';

const DROP_TARGET_ATTR = 'data-navigation-drop-target';
const DROP_FOLDER_ATTR = 'data-navigation-drop-folder';
const DROP_INDEX_ATTR = 'data-navigation-drop-index';
export const DROP_ZONE_ATTR = 'data-navigation-drop-zone';
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
  const {
    addFolderToDraftAtPosition,
    addLinkToDraftAtPosition,
    addObjectToDraftAtPosition,
    addViewToDraftAtPosition,
    addRecordToDraftAtPosition,
  } = useAddToNavigationMenuDraft();
  const { workspaceNavigationMenuItems, navigationMenuItemsDraft } =
    useNavigationMenuItemsDraftState();
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
    } else {
      const itemsInFolder = currentDraft.filter(
        (item) => (item.folderId ?? null) === null,
      );
      index = itemsInFolder.length;
    }

    if (payload.type === 'folder') {
      const newFolderId = addFolderToDraftAtPosition(
        payload.name,
        currentDraft,
        folderId,
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

    if (payload.type === 'link') {
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

    if (payload.type === 'object') {
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

    if (payload.type === 'view') {
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

    if (payload.type === 'record') {
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
  };

  useEffect(() => {
    const handleDocumentDrop = (event: DragEvent) => {
      if (!event.dataTransfer?.types.includes(ADD_TO_NAVIGATION_DRAG_TYPE)) {
        return;
      }

      const data = event.dataTransfer.getData(ADD_TO_NAVIGATION_DRAG_TYPE);
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
    };

    const handleDocumentDragOver = (event: DragEvent) => {
      if (!event.dataTransfer?.types.includes(ADD_TO_NAVIGATION_DRAG_TYPE)) {
        return;
      }

      const element = document.elementFromPoint(
        event.clientX,
        event.clientY,
      ) as HTMLElement | null;
      const isOverSidebar = element?.closest(`[${DROP_ZONE_ATTR}]`);

      if (isDefined(isOverSidebar)) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
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
  ]);

  const handleDragOver = (event: React.DragEvent) => {
    if (event.dataTransfer.types.includes(ADD_TO_NAVIGATION_DRAG_TYPE)) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDragEnter = (event: React.DragEvent) => {
    if (event.dataTransfer.types.includes(ADD_TO_NAVIGATION_DRAG_TYPE)) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    const data = event.dataTransfer.getData(ADD_TO_NAVIGATION_DRAG_TYPE);
    if (!data) return;

    event.preventDefault();
    event.stopPropagation();
    processDrop(event.nativeEvent, data);
  };

  return (
    <StyledDropZone
      {...{ [DROP_ZONE_ATTR]: '' }}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDrop={handleDrop}
    >
      {children}
    </StyledDropZone>
  );
};

export const NavigationDropTargetAttributes = {
  target: DROP_TARGET_ATTR,
  folder: DROP_FOLDER_ATTR,
  index: DROP_INDEX_ATTR,
};

export const getNavigationDropTargetProps = (
  folderId: string | null,
  index: number,
) => ({
  [DROP_TARGET_ATTR]: '',
  [DROP_FOLDER_ATTR]: folderId ?? 'orphan',
  [DROP_INDEX_ATTR]: String(index),
});
