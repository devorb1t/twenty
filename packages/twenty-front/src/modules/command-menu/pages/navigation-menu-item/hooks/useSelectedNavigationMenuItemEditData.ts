import { useRecoilValue } from 'recoil';

import { useWorkspaceSectionItems } from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/utils/getObjectMetadataForNavigationMenuItem';
import { NAVIGATION_MENU_ITEM_TYPE } from '@/navigation-menu-item/types/navigation-menu-item-type';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/types/processed-navigation-menu-item';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { coreViewsState } from '@/views/states/coreViewState';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';

export const useSelectedNavigationMenuItemEditData = () => {
  const selectedNavigationMenuItemInEditMode = useRecoilValue(
    selectedNavigationMenuItemInEditModeState,
  );
  const items = useWorkspaceSectionItems();
  const coreViews = useRecoilValue(coreViewsState);
  const views = coreViews.map(convertCoreViewToView);
  const { objectMetadataItems } = useObjectMetadataItems();

  const selectedItem = selectedNavigationMenuItemInEditMode
    ? items.find((item) => item.id === selectedNavigationMenuItemInEditMode)
    : undefined;

  const selectedItemType = selectedItem?.itemType ?? null;
  const selectedItemObjectMetadata = selectedItem
    ? getObjectMetadataForNavigationMenuItem(
        selectedItem as ProcessedNavigationMenuItem,
        objectMetadataItems,
        views,
      )
    : null;
  const selectedItemLabel = selectedItem
    ? selectedItemType === NAVIGATION_MENU_ITEM_TYPE.FOLDER
      ? (selectedItem.name ?? 'Folder')
      : selectedItemType === NAVIGATION_MENU_ITEM_TYPE.LINK
        ? (selectedItem.name ?? 'Link')
        : (selectedItemObjectMetadata?.labelPlural ?? '')
    : null;

  const processedItem = selectedItem as ProcessedNavigationMenuItem | undefined;

  return {
    selectedItem,
    selectedItemType,
    selectedItemObjectMetadata,
    selectedItemLabel,
    processedItem,
  };
};
