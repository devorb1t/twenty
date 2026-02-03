import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';

export const createStandardNavigationMenuItemFolderFlatMetadata = ({
  universalIdentifier,
  name,
  position,
  navigationMenuItemId,
  workspaceId,
  twentyStandardApplicationId,
  now,
}: {
  universalIdentifier: string;
  name: string;
  position: number;
  navigationMenuItemId: string;
  workspaceId: string;
  twentyStandardApplicationId: string;
  now: string;
}): FlatNavigationMenuItem => ({
  id: navigationMenuItemId,
  universalIdentifier,
  applicationId: twentyStandardApplicationId,
  workspaceId,
  userWorkspaceId: null,
  targetRecordId: null,
  targetObjectMetadataId: null,
  viewId: null,
  folderId: null,
  name,
  position,
  createdAt: now,
  updatedAt: now,
});

export const createStandardNavigationMenuItemFolderItemFlatMetadata = ({
  universalIdentifier,
  viewUniversalIdentifier,
  folderId,
  position,
  navigationMenuItemId,
  workspaceId,
  twentyStandardApplicationId,
  dependencyFlatEntityMaps: { flatViewMaps },
  now,
}: {
  universalIdentifier: string;
  viewUniversalIdentifier: string;
  folderId: string;
  position: number;
  navigationMenuItemId: string;
  workspaceId: string;
  twentyStandardApplicationId: string;
  dependencyFlatEntityMaps: {
    flatViewMaps: FlatEntityMaps<FlatView>;
  };
  now: string;
}): FlatNavigationMenuItem => {
  const flatView = findFlatEntityByUniversalIdentifier({
    flatEntityMaps: flatViewMaps,
    universalIdentifier: viewUniversalIdentifier,
  });

  if (!flatView) {
    throw new Error(
      `View not found for universal identifier ${viewUniversalIdentifier}`,
    );
  }

  return {
    id: navigationMenuItemId,
    universalIdentifier,
    applicationId: twentyStandardApplicationId,
    workspaceId,
    userWorkspaceId: null,
    targetRecordId: null,
    targetObjectMetadataId: null,
    viewId: flatView.id,
    folderId,
    name: null,
    position,
    createdAt: now,
    updatedAt: now,
  };
};
