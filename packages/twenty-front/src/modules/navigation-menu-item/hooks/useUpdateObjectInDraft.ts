import { useSetRecoilState } from 'recoil';

import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const useUpdateObjectInDraft = () => {
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

  return { updateObjectInDraft };
};
