import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type CreateFrontComponentInput } from 'src/engine/metadata-modules/front-component/dtos/create-front-component.input';
import { type UniversalFlatFrontComponent } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-front-component.type';

export const fromCreateFrontComponentInputToFlatFrontComponentToCreate = ({
  createFrontComponentInput,
  applicationUniversalIdentifier,
}: {
  createFrontComponentInput: CreateFrontComponentInput;
  applicationUniversalIdentifier: string;
}): UniversalFlatFrontComponent & { id: string } => {
  const now = new Date().toISOString();
  const frontComponentId = createFrontComponentInput.id ?? v4();

  const { name } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      createFrontComponentInput,
      ['name'],
    );

  const universalIdentifier =
    createFrontComponentInput.universalIdentifier ?? v4();

  return {
    id: frontComponentId,
    name: name ?? createFrontComponentInput.componentName,
    description: createFrontComponentInput.description ?? null,
    sourceComponentPath: createFrontComponentInput.sourceComponentPath,
    builtComponentPath: createFrontComponentInput.builtComponentPath,
    componentName: createFrontComponentInput.componentName,
    builtComponentChecksum: createFrontComponentInput.builtComponentChecksum,
    createdAt: now,
    updatedAt: now,
    universalIdentifier,
    applicationUniversalIdentifier,
  };
};
