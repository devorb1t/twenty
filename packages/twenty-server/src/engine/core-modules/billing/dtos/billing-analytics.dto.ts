/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { BillingUsageBreakdownItemDTO } from 'src/engine/core-modules/billing/dtos/billing-usage-breakdown-item.dto';
import { BillingUsageTimeSeriesDTO } from 'src/engine/core-modules/billing/dtos/billing-usage-time-series.dto';
import { BillingUserDailyUsageDTO } from 'src/engine/core-modules/billing/dtos/billing-user-daily-usage.dto';

@ObjectType('BillingAnalytics')
export class BillingAnalyticsDTO {
  @Field(() => [BillingUsageBreakdownItemDTO])
  usageByUser: BillingUsageBreakdownItemDTO[];

  @Field(() => [BillingUsageBreakdownItemDTO])
  usageByResource: BillingUsageBreakdownItemDTO[];

  @Field(() => [BillingUsageBreakdownItemDTO])
  usageByExecutionType: BillingUsageBreakdownItemDTO[];

  @Field(() => [BillingUsageTimeSeriesDTO])
  timeSeries: BillingUsageTimeSeriesDTO[];

  @Field(() => Date)
  periodStart: Date;

  @Field(() => Date)
  periodEnd: Date;

  @Field(() => BillingUserDailyUsageDTO, { nullable: true })
  userDailyUsage?: BillingUserDailyUsageDTO;
}
