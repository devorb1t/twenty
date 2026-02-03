import { useSetRecoilState } from 'recoil';
import { v4 } from 'uuid';

import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import type { NavigationMenuItem } from '~/generated-metadata/graphql';

export const useAddObjectToNavigationMenuDraft = () => {
  const setNavigationMenuItemsDraft = useSetRecoilState(
    navigationMenuItemsDraftState,
  );

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

  return { addObjectToDraft };
};
