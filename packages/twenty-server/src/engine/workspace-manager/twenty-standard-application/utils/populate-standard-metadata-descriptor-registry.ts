import 'src/engine/metadata-modules/page-layout-tab/constants/standard-page-layout-tab-titles';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { buildStandardFlatFieldMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/build-standard-flat-field-metadata-maps.util';
import { getStandardObjectMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-object-metadata-related-entity-ids.util';
import { buildStandardFlatObjectMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/object-metadata/build-standard-flat-object-metadata-maps.util';

// `i18nLabel(msg`...`)` only registers descriptors when the builder lambdas
// run. Workspace sync runs them for real workspaces, but restarts don't —
// so we do one discard-only pass at module load to keep translations working.
const PLACEHOLDER_ARGS = {
  now: '',
  workspaceId: '',
  twentyStandardApplicationId: '',
  standardObjectMetadataRelatedEntityIds:
    getStandardObjectMetadataRelatedEntityIds(),
};

const flatObjectMetadataMaps = buildStandardFlatObjectMetadataMaps({
  ...PLACEHOLDER_ARGS,
  dependencyFlatEntityMaps: {
    flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
  },
});

buildStandardFlatFieldMetadataMaps({
  ...PLACEHOLDER_ARGS,
  dependencyFlatEntityMaps: {
    flatObjectMetadataMaps,
  },
});
