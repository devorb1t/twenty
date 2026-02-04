import { useSetRecoilState } from 'recoil';

import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/utils/isNavigationMenuItemFolder';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type View } from '@/views/types/View';

export const useUpdateNavigationMenuItemsDraft = () => {
  const setNavigationMenuItemsDraft = useSetRecoilState(
    navigationMenuItemsDraftState,
  );

  const updateObjectInDraft = (
    navigationMenuItemId: string,
    objectMetadataItem: ObjectMetadataItem,
    defaultViewId: string,
  ) => {
    setNavigationMenuItemsDraft((draft) => {
      if (!draft) return draft;

      return draft.map((item) =>
        item.id === navigationMenuItemId
          ? {
              ...item,
              viewId: defaultViewId,
              targetObjectMetadataId: objectMetadataItem.id,
              targetRecordId: undefined,
            }
          : item,
      );
    });
  };

  const updateViewInDraft = (navigationMenuItemId: string, view: View) => {
    setNavigationMenuItemsDraft((draft) => {
      if (!draft) return draft;

      return draft.map((item) =>
        item.id === navigationMenuItemId
          ? {
              ...item,
              viewId: view.id,
              targetObjectMetadataId: undefined,
              targetRecordId: undefined,
            }
          : item,
      );
    });
  };

  const updateFolderNameInDraft = (folderId: string, name: string) => {
    setNavigationMenuItemsDraft((draft) => {
      if (!draft) return draft;

      return draft.map((item) =>
        isNavigationMenuItemFolder(item) && item.id === folderId
          ? { ...item, name }
          : item,
      );
    });
  };

  return {
    updateObjectInDraft,
    updateViewInDraft,
    updateFolderNameInDraft,
  };
};
