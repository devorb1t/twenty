import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

@ObjectType('AgentChatEvent')
export class AgentChatEventDTO {
  @Field(() => String)
  threadId: string;

  @Field(() => GraphQLJSON)
  event: Record<string, unknown>;
}
