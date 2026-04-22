import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

// `operationType` + `unit` are not redundant: operationType is the semantic
// category (WEB_SEARCH, CODE_EXECUTION) used by the billing/analytics
// pipeline, while unit is how the quantity is counted (INVOCATION, TOKEN,
// MINUTE, BYTE). The same operation can legitimately be billed on different
// units — e.g. two code-interpreter apps pricing per MINUTE vs per
// INVOCATION — and we mirror the existing `UsageEvent` shape so app-sourced
// records flow through the same listeners as native ones.
export class ChargeDto {
  @IsInt()
  @Min(0)
  creditsUsedMicro!: number;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsEnum(UsageUnit)
  unit!: UsageUnit;

  @IsEnum(UsageOperationType)
  operationType!: UsageOperationType;

  @IsOptional()
  @IsString()
  resourceContext?: string;
}
