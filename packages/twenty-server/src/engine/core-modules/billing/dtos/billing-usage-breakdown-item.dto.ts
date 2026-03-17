/* @license Enterprise */

import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType('BillingUsageBreakdownItem')
export class BillingUsageBreakdownItemDTO {
  @Field(() => String)
  key: string;

  @Field(() => String, { nullable: true })
  label?: string;

  @Field(() => Float)
  creditsUsed: number;
}
