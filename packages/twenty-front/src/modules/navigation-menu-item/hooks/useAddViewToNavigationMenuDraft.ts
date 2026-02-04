import { useSetRecoilState } from 'recoil';
import { v4 } from 'uuid';

import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { type View } from '@/views/types/View';
import type { NavigationMenuItem } from '~/generated-metadata/graphql';

export const useAddViewToNavigationMenuDraft = () => {
  const setNavigationMenuItemsDraft = useSetRecoilState(
    navigationMenuItemsDraftState,
  );

  const addViewToDraft = (
    view: View,
    currentDraft: NavigationMenuItem[],
  ) => {
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

  return { addViewToDraft };
};
