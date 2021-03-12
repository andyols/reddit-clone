import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import { Field, ObjectType } from 'type-graphql'

@ObjectType()
@Entity()
export class Post {
  @Field() // exposes this field in schema
  @PrimaryKey()
  id!: number

  @Field(() => String) // explicitly set type to this field
  @Property({ type: 'date' })
  createdAt: Date = new Date()

  @Field(() => String)
  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt: Date = new Date()

  @Field()
  @Property({ type: 'text' })
  title!: string
}
