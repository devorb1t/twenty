import { Field, InputType } from '@nestjs/graphql';

// Mirrors the `WorkflowAttachment` shape from twenty-shared (id/name/size/type/
// createdAt). Inlined as a GraphQL input so the side-panel composer can pass
// already-uploaded files without depending on workflow types. If you change
// either side, keep both in sync — `EmailComposerService.getAttachments`
// resolves files by id, so the field names matter.
@InputType()
export class SendEmailAttachmentInput {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => Number)
  size: number;

  @Field(() => String)
  type: string;

  @Field(() => String)
  createdAt: string;
}

@InputType()
export class SendEmailInput {
  @Field(() => String)
  connectedAccountId: string;

  @Field(() => String)
  to: string;

  @Field(() => String, { nullable: true })
  cc?: string;

  @Field(() => String, { nullable: true })
  bcc?: string;

  @Field(() => String)
  subject: string;

  @Field(() => String)
  body: string;

  @Field(() => String, { nullable: true })
  inReplyTo?: string;

  @Field(() => [SendEmailAttachmentInput], { nullable: true })
  files?: SendEmailAttachmentInput[];
}
