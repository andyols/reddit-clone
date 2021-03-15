import { Field, InputType } from 'type-graphql'

// login/register mutation argument

@InputType()
export class UserOptions {
  @Field()
  email: string
  @Field()
  username: string
  @Field()
  password: string
}
