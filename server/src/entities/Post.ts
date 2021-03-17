import { Field, Int, ObjectType } from 'type-graphql'
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'
import { Doot } from './Doot'
import { User } from './User'

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field() // exposes this field in schema
  @PrimaryGeneratedColumn()
  id!: number

  @Field()
  @Column()
  title!: string

  @Field()
  @Column()
  text!: string

  @Field()
  @Column({ type: 'int', default: 0 })
  points!: number

  @Field(() => Int, { nullable: true })
  dootStatus: number | null // 1, -1 or null

  @Field()
  @Column()
  creatorId: number

  @Field()
  @ManyToOne(() => User, (user) => user.posts)
  creator: User

  @OneToMany(() => Doot, (doot) => doot.post)
  doots: Doot[]

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date
}
