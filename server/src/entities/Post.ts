import { Field, ObjectType } from 'type-graphql'
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field() // exposes this field in schema
  @PrimaryGeneratedColumn()
  id!: number

  @Field(() => String) // explicitly set type to this field
  @CreateDateColumn({ type: 'date' })
  createdAt: Date

  @Field(() => String)
  @UpdateDateColumn({ type: 'date' })
  updatedAt: Date

  @Field()
  @Column()
  title!: string
}
