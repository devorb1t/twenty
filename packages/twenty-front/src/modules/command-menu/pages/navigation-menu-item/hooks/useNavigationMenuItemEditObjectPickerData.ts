import { isDefined } from 'twenty-shared/utils';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

import { useNavigationMenuObjectMetadataFromDraft } from '@/navigation-menu-item/hooks/useNavigationMenuObjectMetadataFromDraft';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';

const includeCurrentObjectIfMissing = (
  objects: ObjectMetadataItem[],
  current: ObjectMetadataItem | undefined,
): ObjectMetadataItem[] =>
  isDefined(current) && !objects.some((object) => object.id === current.id)
    ? [current, ...objects].sort((a, b) =>
        a.labelPlural.localeCompare(b.labelPlural),
      )
    : objects;

type CurrentDraftItem = {
  id?: string;
  viewId?: string | null;
  targetObjectMetadataId?: string | null;
};

export const useNavigationMenuItemEditObjectPickerData = (
  selectedItemObjectMetadata: ObjectMetadataItem | null,
  selectedItem: ProcessedNavigationMenuItem | undefined,
  currentDraft: CurrentDraftItem[],
) => {
  const { objectMetadataItems } = useObjectMetadataItems();
  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();

  const {
    objectMetadataIdsInWorkspace: objectMetadataItemsInWorkspaceIds,
    objectMetadataIdsWithIndexView,
    objectMetadataIdsWithAnyView,
  } = useNavigationMenuObjectMetadataFromDraft(currentDraft);

  const currentObjectMetadataId =
    selectedItemObjectMetadata?.id ??
    (selectedItem as ProcessedNavigationMenuItem | undefined)
      ?.targetObjectMetadataId ??
    undefined;

  const currentObject =
    currentObjectMetadataId !== undefined
      ? objectMetadataItems.find((item) => item.id === currentObjectMetadataId)
      : undefined;

  const objectsForObjectPicker = activeNonSystemObjectMetadataItems
    .filter((item) => objectMetadataIdsWithIndexView.has(item.id))
    .filter((item) => !objectMetadataItemsInWorkspaceIds.has(item.id))
    .sort((a, b) => a.labelPlural.localeCompare(b.labelPlural));

  const objectsForObjectPickerIncludingCurrent = includeCurrentObjectIfMissing(
    objectsForObjectPicker,
    currentObject,
  );

  const activeSystemObjectMetadataItems = objectMetadataItems
    .filter((item) => item.isActive && item.isSystem)
    .sort((a, b) => a.labelPlural.localeCompare(b.labelPlural));

  const systemObjectsForObjectPicker = activeSystemObjectMetadataItems.filter(
    (item) =>
      objectMetadataIdsWithIndexView.has(item.id) &&
      (!objectMetadataItemsInWorkspaceIds.has(item.id) ||
        item.id === currentObjectMetadataId),
  );

  const objectsForViewEdit = activeNonSystemObjectMetadataItems
    .filter((item) => objectMetadataIdsWithAnyView.has(item.id))
    .sort((a, b) => a.labelPlural.localeCompare(b.labelPlural));
  const objectsForViewEditObjectPicker = includeCurrentObjectIfMissing(
    objectsForViewEdit,
    currentObject,
  );

  const systemObjectsForViewEditObjectPicker =
    activeSystemObjectMetadataItems.filter((item) =>
      objectMetadataIdsWithAnyView.has(item.id),
    );

  return {
    objectsForObjectPickerIncludingCurrent,
    objectsForViewEditObjectPicker,
    systemObjectsForObjectPicker,
    systemObjectsForViewEditObjectPicker,
  };
};
