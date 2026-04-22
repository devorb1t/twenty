import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

// Billing payload apps send to POST /app/billing/charge. `operationType` is
// the existing workspace usage taxonomy — apps pick the appropriate entry
// (e.g. WEB_SEARCH for search-style apps, CODE_EXECUTION for sandbox-style
// apps). `unit` and `quantity` describe the billable thing; the credit
// amount is expressed in micro-credits so fractional pricing works.
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
  resourceContext?: string;
}
