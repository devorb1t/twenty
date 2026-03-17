/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { BillingUsageTimeSeriesDTO } from 'src/engine/core-modules/billing/dtos/billing-usage-time-series.dto';

@ObjectType('BillingUserDailyUsage')
export class BillingUserDailyUsageDTO {
  @Field(() => String)
  userWorkspaceId: string;

  @Field(() => [BillingUsageTimeSeriesDTO])
  dailyUsage: BillingUsageTimeSeriesDTO[];
}
