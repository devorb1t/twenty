import { useSelectedNavigationMenuItemEditItem } from '@/navigation-menu-item/hooks/useSelectedNavigationMenuItemEditItem';
import { useSelectedNavigationMenuItemEditItemObjectMetadata } from '@/navigation-menu-item/hooks/useSelectedNavigationMenuItemEditItemObjectMetadata';
import { NAVIGATION_MENU_ITEM_TYPE } from '@/navigation-menu-item/types/navigation-menu-item-type';

export const useSelectedNavigationMenuItemEditItemLabel = () => {
  const { selectedItem } = useSelectedNavigationMenuItemEditItem();
  const { selectedItemObjectMetadata } =
    useSelectedNavigationMenuItemEditItemObjectMetadata();

  const selectedItemLabel = selectedItem
    ? selectedItem.itemType === NAVIGATION_MENU_ITEM_TYPE.FOLDER
      ? (selectedItem.name ?? 'Folder')
      : selectedItem.itemType === NAVIGATION_MENU_ITEM_TYPE.LINK
        ? (selectedItem.name ?? 'Link')
        : (selectedItemObjectMetadata?.labelPlural ?? '')
    : null;

  return { selectedItemLabel };
};
