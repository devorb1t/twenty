import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

import { useWorkspaceSectionItems } from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { getNavigationMenuItemType } from '@/navigation-menu-item/utils/getNavigationMenuItemType';
import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/utils/getObjectMetadataForNavigationMenuItem';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { useGetStandardObjectIcon } from '@/object-metadata/hooks/useGetStandardObjectIcon';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { coreViewsState } from '@/views/states/coreViewState';
import { ViewKey } from '@/views/types/ViewKey';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';

export const useSelectedNavigationMenuItemEditData = () => {
  const selectedNavigationMenuItemInEditMode = useRecoilValue(
    selectedNavigationMenuItemInEditModeState,
  );
  const items = useWorkspaceSectionItems();
  const coreViews = useRecoilValue(coreViewsState);
  const views = coreViews.map(convertCoreViewToView);
  const { objectMetadataItems } = useObjectMetadataItems();
  const { getIcon } = useIcons();

  const selectedItem = selectedNavigationMenuItemInEditMode
    ? items.find((item) => item.id === selectedNavigationMenuItemInEditMode)
    : undefined;

  const selectedItemType = selectedItem
    ? getNavigationMenuItemType(selectedItem)
    : null;
  const selectedItemObjectMetadata = selectedItem
    ? getObjectMetadataForNavigationMenuItem(
        selectedItem as ProcessedNavigationMenuItem,
        objectMetadataItems,
        views,
      )
    : null;
  const selectedItemLabel = selectedItem
    ? selectedItemType === 'folder'
      ? (selectedItem.name ?? 'Folder')
      : selectedItemType === 'link'
        ? (selectedItem.name ?? 'Link')
        : (selectedItemObjectMetadata?.labelPlural ?? '')
    : null;

  const processedItem = selectedItem as ProcessedNavigationMenuItem | undefined;
  const objectNameSingularForViewItem =
    selectedItemObjectMetadata?.nameSingular ?? '';
  const { Icon: StandardObjectIconForViewItem } = useGetStandardObjectIcon(
    objectNameSingularForViewItem,
  );
  const isFolderItem = selectedItemType === 'folder';
  const isLinkItem = selectedItemType === 'link';
  const isObjectItem =
    processedItem !== undefined &&
    selectedItemType === 'objectView' &&
    selectedItemObjectMetadata !== null &&
    processedItem.viewKey === ViewKey.Index &&
    !isDefined(processedItem.targetRecordId);
  const isViewItem =
    processedItem !== undefined &&
    selectedItemType === 'objectView' &&
    selectedItemObjectMetadata !== null &&
    processedItem.viewKey !== ViewKey.Index &&
    isDefined(processedItem.viewId) &&
    !isDefined(processedItem.targetRecordId);

  const objectIcon =
    StandardObjectIconForViewItem ??
    getIcon(selectedItemObjectMetadata?.icon ?? 'IconCube');

  return {
    selectedNavigationMenuItemInEditMode,
    selectedItem,
    selectedItemType,
    selectedItemObjectMetadata,
    selectedItemLabel,
    processedItem,
    isFolderItem,
    isLinkItem,
    isObjectItem,
    isViewItem,
    objectIcon,
    getIcon,
    items,
  };
};
