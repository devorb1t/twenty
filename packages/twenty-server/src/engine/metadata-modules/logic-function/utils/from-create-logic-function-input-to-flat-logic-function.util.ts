import { v4 } from 'uuid';

import { type CreateLogicFunctionInput } from 'src/engine/metadata-modules/logic-function/dtos/create-logic-function.input';
import {
  DEFAULT_HANDLER_NAME,
  LogicFunctionRuntime,
} from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { type UniversalFlatLogicFunction } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-logic-function.type';

export type FromCreateLogicFunctionInputToFlatLogicFunctionArgs = {
  createLogicFunctionInput: Omit<CreateLogicFunctionInput, 'applicationId'>;
  applicationUniversalIdentifier: string;
};

export const fromCreateLogicFunctionInputToFlatLogicFunction = ({
  createLogicFunctionInput: rawCreateLogicFunctionInput,
  applicationUniversalIdentifier,
}: FromCreateLogicFunctionInputToFlatLogicFunctionArgs): UniversalFlatLogicFunction & {
  id: string;
} => {
  const id = rawCreateLogicFunctionInput.id ?? v4();
  const currentDate = new Date();

  const sourceHandlerPath = rawCreateLogicFunctionInput.sourceHandlerPath;
  const builtHandlerPath = rawCreateLogicFunctionInput.builtHandlerPath;

  const universalIdentifier =
    rawCreateLogicFunctionInput.universalIdentifier ?? v4();

  const checksum = rawCreateLogicFunctionInput.checksum;

  return {
    id,
    cronTriggerSettings:
      rawCreateLogicFunctionInput.cronTriggerSettings ?? null,
    databaseEventTriggerSettings:
      rawCreateLogicFunctionInput.databaseEventTriggerSettings ?? null,
    httpRouteTriggerSettings:
      rawCreateLogicFunctionInput.httpRouteTriggerSettings ?? null,
    name: rawCreateLogicFunctionInput.name,
    description: rawCreateLogicFunctionInput.description ?? null,
    sourceHandlerPath,
    handlerName:
      rawCreateLogicFunctionInput.handlerName ?? DEFAULT_HANDLER_NAME,
    builtHandlerPath,
    universalIdentifier,
    createdAt: currentDate.toISOString(),
    updatedAt: currentDate.toISOString(),
    deletedAt: null,
    runtime: LogicFunctionRuntime.NODE22,
    timeoutSeconds: rawCreateLogicFunctionInput.timeoutSeconds ?? 300,
    checksum,
    toolInputSchema: rawCreateLogicFunctionInput.toolInputSchema ?? null,
    isTool: rawCreateLogicFunctionInput?.isTool ?? false,
    applicationUniversalIdentifier,
  };
};
