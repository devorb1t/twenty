/* @license Enterprise */

import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

// `operationType` + `unit` are not redundant: operationType is the semantic
// category (WEB_SEARCH, CODE_EXECUTION) used by the billing/analytics
// pipeline, while unit is how the quantity is counted (INVOCATION, TOKEN,
// MINUTE, BYTE). The same operation can legitimately be billed on different
// units — e.g. two code-interpreter apps pricing per MINUTE vs per
// INVOCATION — and we mirror the existing `UsageEvent` shape so app-sourced
// records flow through the same listeners as native ones.

// Sanity cap on a single charge: $1000 in micro-credits (1 USD = 1,000,000
// micro-credits, see DOLLAR_TO_CREDIT_MULTIPLIER). Realistic app calls are
// cents to a few dollars; this bound keeps a compromised or buggy app from
// draining credits or corrupting accounting before downstream caps fire.
const MAX_CREDITS_USED_MICRO_PER_CHARGE = 1_000_000_000;

// Per-charge quantity cap. A single app charge represents one logical
// operation; 10_000 is generous for batched calls while still rejecting
// `Number.MAX_SAFE_INTEGER`-style abuse.
const MAX_QUANTITY_PER_CHARGE = 10_000;

export class ChargeDto {
  @IsInt()
  @Min(0)
  @Max(MAX_CREDITS_USED_MICRO_PER_CHARGE)
  creditsUsedMicro!: number;

  @IsInt()
  @Min(1)
  @Max(MAX_QUANTITY_PER_CHARGE)
  quantity!: number;

  @IsEnum(UsageUnit)
  unit!: UsageUnit;

  @IsEnum(UsageOperationType)
  operationType!: UsageOperationType;

  @IsOptional()
  @IsString()
  resourceContext?: string;
}
