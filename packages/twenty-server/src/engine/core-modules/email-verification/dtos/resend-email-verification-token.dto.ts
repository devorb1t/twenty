import { Field, ObjectType } from '@nestjs/graphql';

import { IsBoolean } from 'class-validator';

@ObjectType('ResendEmailVerificationToken')
export class ResendEmailVerificationTokenDTO {
  @IsBoolean()
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String, { nullable: true })
  message?: string;
}
