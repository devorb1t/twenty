import { useRecoilValue, useSetRecoilState } from 'recoil';
import { v4 } from 'uuid';
import { isDefined } from 'twenty-shared/utils';
import type { NavigationMenuItem } from '~/generated-metadata/graphql';

import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type View } from '@/views/types/View';

type SearchRecord = {
  recordId: string;
  objectNameSingular: string;
  label: string;
  imageUrl?: string | null;
};

export const useAddToNavigationMenuDraft = () => {
  const setNavigationMenuItemsDraft = useSetRecoilState(
    navigationMenuItemsDraftState,
  );
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const addObjectToDraft = (
    objectMetadataItem: ObjectMetadataItem,
    defaultViewId: string,
    currentDraft: NavigationMenuItem[],
  ) => {
    const maxPosition = Math.max(
      ...currentDraft.map((item) => item.position),
      0,
    );

    const newItem: NavigationMenuItem = {
      __typename: 'NavigationMenuItem',
      id: v4(),
      viewId: defaultViewId,
      targetObjectMetadataId: objectMetadataItem.id,
      position: maxPosition + 1,
      userWorkspaceId: undefined,
      targetRecordId: undefined,
      folderId: undefined,
      name: undefined,
      applicationId: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNavigationMenuItemsDraft([...currentDraft, newItem]);
  };

  const addViewToDraft = (view: View, currentDraft: NavigationMenuItem[]) => {
    const maxPosition = Math.max(
      ...currentDraft.map((item) => item.position),
      0,
    );

    const newItem: NavigationMenuItem = {
      __typename: 'NavigationMenuItem',
      id: v4(),
      viewId: view.id,
      targetObjectMetadataId: undefined,
      position: maxPosition + 1,
      userWorkspaceId: undefined,
      targetRecordId: undefined,
      folderId: undefined,
      name: undefined,
      applicationId: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNavigationMenuItemsDraft([...currentDraft, newItem]);
  };

  const addFolderToDraft = (
    name: string,
    currentDraft: NavigationMenuItem[],
  ): string => {
    const maxPosition = Math.max(
      ...currentDraft.map((item) => item.position),
      0,
    );

    const newItemId = v4();
    const newItem: NavigationMenuItem = {
      __typename: 'NavigationMenuItem',
      id: newItemId,
      viewId: undefined,
      targetObjectMetadataId: undefined,
      targetRecordId: undefined,
      folderId: undefined,
      position: maxPosition + 1,
      userWorkspaceId: undefined,
      name: name.trim(),
      applicationId: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNavigationMenuItemsDraft([...currentDraft, newItem]);
    return newItemId;
  };

  const addFolderToDraftAtPosition = (
    name: string,
    currentDraft: NavigationMenuItem[],
    targetFolderId: string | null,
    targetIndex: number,
  ): string => {
    const itemsInFolder = currentDraft.filter(
      (item) =>
        (item.folderId ?? null) === targetFolderId &&
        !isDefined(item.userWorkspaceId),
    );
    const insertRef = itemsInFolder[targetIndex];
    const lastInFolder = itemsInFolder[itemsInFolder.length - 1];
    const flatIndex = insertRef
      ? currentDraft.indexOf(insertRef)
      : lastInFolder
        ? currentDraft.indexOf(lastInFolder) + 1
        : currentDraft.length;
    const prevPosition = itemsInFolder[targetIndex - 1]?.position ?? 0;
    const nextPosition =
      itemsInFolder[targetIndex]?.position ?? prevPosition + 1;
    const position = (prevPosition + nextPosition) / 2;

    const newItemId = v4();
    const newItem: NavigationMenuItem = {
      __typename: 'NavigationMenuItem',
      id: newItemId,
      viewId: undefined,
      targetObjectMetadataId: undefined,
      targetRecordId: undefined,
      folderId: targetFolderId ?? undefined,
      position,
      userWorkspaceId: undefined,
      name: name.trim(),
      applicationId: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newDraft = [
      ...currentDraft.slice(0, flatIndex),
      newItem,
      ...currentDraft.slice(flatIndex),
    ];
    setNavigationMenuItemsDraft(newDraft);
    return newItemId;
  };

  const addLinkToDraftAtPosition = (
    label: string,
    url: string,
    currentDraft: NavigationMenuItem[],
    targetFolderId: string | null,
    targetIndex: number,
  ): string => {
    const trimmedUrl = url.trim();
    const normalizedUrl =
      trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')
        ? trimmedUrl
        : `https://${trimmedUrl}`;

    const itemsInFolder = currentDraft.filter(
      (item) =>
        (item.folderId ?? null) === targetFolderId &&
        !isDefined(item.userWorkspaceId),
    );
    const insertRef = itemsInFolder[targetIndex];
    const lastInFolder = itemsInFolder[itemsInFolder.length - 1];
    const flatIndex = insertRef
      ? currentDraft.indexOf(insertRef)
      : lastInFolder
        ? currentDraft.indexOf(lastInFolder) + 1
        : currentDraft.length;
    const prevPosition = itemsInFolder[targetIndex - 1]?.position ?? 0;
    const nextPosition =
      itemsInFolder[targetIndex]?.position ?? prevPosition + 1;
    const position = (prevPosition + nextPosition) / 2;

    const newItemId = v4();
    const newItem: NavigationMenuItem = {
      __typename: 'NavigationMenuItem',
      id: newItemId,
      viewId: undefined,
      targetObjectMetadataId: undefined,
      targetRecordId: undefined,
      folderId: targetFolderId ?? undefined,
      position,
      userWorkspaceId: undefined,
      name: label.trim() || 'Link',
      link: normalizedUrl,
      applicationId: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newDraft = [
      ...currentDraft.slice(0, flatIndex),
      newItem,
      ...currentDraft.slice(flatIndex),
    ];
    setNavigationMenuItemsDraft(newDraft);
    return newItemId;
  };

  const addLinkToDraft = (
    label: string,
    url: string,
    currentDraft: NavigationMenuItem[],
    folderId?: string | null,
  ): string => {
    const trimmedUrl = url.trim();
    const normalizedUrl =
      trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')
        ? trimmedUrl
        : `https://${trimmedUrl}`;

    const itemsInSameContext = currentDraft.filter(
      (item) =>
        (item.folderId ?? null) === (folderId ?? null) &&
        !isDefined(item.userWorkspaceId),
    );
    const maxPosition = Math.max(
      ...itemsInSameContext.map((item) => item.position),
      0,
    );

    const newItemId = v4();
    const newItem: NavigationMenuItem = {
      __typename: 'NavigationMenuItem',
      id: newItemId,
      viewId: undefined,
      targetObjectMetadataId: undefined,
      targetRecordId: undefined,
      folderId: folderId ?? undefined,
      position: maxPosition + 1,
      userWorkspaceId: undefined,
      name: label.trim() || 'Link',
      link: normalizedUrl,
      applicationId: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNavigationMenuItemsDraft([...currentDraft, newItem]);
    return newItemId;
  };

  const addRecordToDraft = (
    searchRecord: SearchRecord,
    currentDraft: NavigationMenuItem[],
  ) => {
    const objectMetadataItem = objectMetadataItems.find(
      (item) => item.nameSingular === searchRecord.objectNameSingular,
    );

    if (!isDefined(objectMetadataItem)) {
      return;
    }

    const maxPosition = Math.max(
      ...currentDraft.map((item) => item.position),
      0,
    );

    const newItem: NavigationMenuItem = {
      __typename: 'NavigationMenuItem',
      id: v4(),
      viewId: undefined,
      targetObjectMetadataId: objectMetadataItem.id,
      targetRecordId: searchRecord.recordId,
      targetRecordIdentifier: {
        id: searchRecord.recordId,
        labelIdentifier: searchRecord.label,
        imageIdentifier: searchRecord.imageUrl ?? null,
      },
      position: maxPosition + 1,
      userWorkspaceId: undefined,
      folderId: undefined,
      name: undefined,
      applicationId: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNavigationMenuItemsDraft([...currentDraft, newItem]);
  };

  const insertItemAtPosition = (
    currentDraft: NavigationMenuItem[],
    targetFolderId: string | null,
    targetIndex: number,
    newItem: NavigationMenuItem,
  ): string => {
    const itemsInFolder = currentDraft.filter(
      (item) =>
        (item.folderId ?? null) === targetFolderId &&
        !isDefined(item.userWorkspaceId),
    );
    const insertRef = itemsInFolder[targetIndex];
    const lastInFolder = itemsInFolder[itemsInFolder.length - 1];
    const flatIndex = insertRef
      ? currentDraft.indexOf(insertRef)
      : lastInFolder
        ? currentDraft.indexOf(lastInFolder) + 1
        : currentDraft.length;
    const prevPosition = itemsInFolder[targetIndex - 1]?.position ?? 0;
    const nextPosition =
      itemsInFolder[targetIndex]?.position ?? prevPosition + 1;
    const position = (prevPosition + nextPosition) / 2;

    const itemWithPosition = { ...newItem, position };
    const newDraft = [
      ...currentDraft.slice(0, flatIndex),
      itemWithPosition,
      ...currentDraft.slice(flatIndex),
    ];
    setNavigationMenuItemsDraft(newDraft);
    return newItem.id;
  };

  const addObjectToDraftAtPosition = (
    objectMetadataId: string,
    defaultViewId: string,
    currentDraft: NavigationMenuItem[],
    targetFolderId: string | null,
    targetIndex: number,
  ): string => {
    const newItem: NavigationMenuItem = {
      __typename: 'NavigationMenuItem',
      id: v4(),
      viewId: defaultViewId,
      targetObjectMetadataId: objectMetadataId,
      position: 1,
      userWorkspaceId: undefined,
      targetRecordId: undefined,
      folderId: targetFolderId ?? undefined,
      name: undefined,
      applicationId: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return insertItemAtPosition(
      currentDraft,
      targetFolderId,
      targetIndex,
      newItem,
    );
  };

  const addViewToDraftAtPosition = (
    viewId: string,
    currentDraft: NavigationMenuItem[],
    targetFolderId: string | null,
    targetIndex: number,
  ): string => {
    const newItem: NavigationMenuItem = {
      __typename: 'NavigationMenuItem',
      id: v4(),
      viewId,
      targetObjectMetadataId: undefined,
      position: 1,
      userWorkspaceId: undefined,
      targetRecordId: undefined,
      folderId: targetFolderId ?? undefined,
      name: undefined,
      applicationId: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return insertItemAtPosition(
      currentDraft,
      targetFolderId,
      targetIndex,
      newItem,
    );
  };

  const addRecordToDraftAtPosition = (
    searchRecord: SearchRecord & { objectMetadataId: string },
    currentDraft: NavigationMenuItem[],
    targetFolderId: string | null,
    targetIndex: number,
  ): string => {
    const newItem: NavigationMenuItem = {
      __typename: 'NavigationMenuItem',
      id: v4(),
      viewId: undefined,
      targetObjectMetadataId: searchRecord.objectMetadataId,
      targetRecordId: searchRecord.recordId,
      targetRecordIdentifier: {
        id: searchRecord.recordId,
        labelIdentifier: searchRecord.label,
        imageIdentifier: searchRecord.imageUrl ?? null,
      },
      position: 1,
      userWorkspaceId: undefined,
      folderId: targetFolderId ?? undefined,
      name: undefined,
      applicationId: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return insertItemAtPosition(
      currentDraft,
      targetFolderId,
      targetIndex,
      newItem,
    );
  };

  return {
    addObjectToDraft,
    addObjectToDraftAtPosition,
    addViewToDraft,
    addViewToDraftAtPosition,
    addRecordToDraft,
    addRecordToDraftAtPosition,
    addFolderToDraft,
    addFolderToDraftAtPosition,
    addLinkToDraft,
    addLinkToDraftAtPosition,
  };
};
