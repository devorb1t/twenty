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

  return { addObjectToDraft, addViewToDraft, addRecordToDraft };
};
