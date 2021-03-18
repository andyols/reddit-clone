import { ObjectType } from 'type-graphql'
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm'
import { Post } from './Post'
import { User } from './User'

@ObjectType()
@Entity()
export class Doot extends BaseEntity {
  @Column({ type: 'int' })
  value: number

  @PrimaryColumn()
  userId: number

  @ManyToOne(() => User, (user) => user.doots)
  user: User

  @PrimaryColumn()
  postId: number

  @ManyToOne(() => Post, (user) => user.doots, {
    onDelete: 'CASCADE'
  })
  post: Post
}
