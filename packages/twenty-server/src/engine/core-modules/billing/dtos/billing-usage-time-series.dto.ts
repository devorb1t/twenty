/* @license Enterprise */

import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType('BillingUsageTimeSeries')
export class BillingUsageTimeSeriesDTO {
  @Field(() => String)
  date: string;

  @Field(() => Float)
  creditsUsed: number;
}
