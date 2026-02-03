import { useRecoilValue, useSetRecoilState } from 'recoil';
import { v4 } from 'uuid';

import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { isDefined } from 'twenty-shared/utils';
import type { NavigationMenuItem } from '~/generated-metadata/graphql';

type SearchRecord = {
  recordId: string;
  objectNameSingular: string;
  label: string;
  imageUrl?: string | null;
};

export const useAddRecordToNavigationMenuDraft = () => {
  const setNavigationMenuItemsDraft = useSetRecoilState(
    navigationMenuItemsDraftState,
  );
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

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

  return { addRecordToDraft };
};
