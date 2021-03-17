import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware
} from 'type-graphql'
import { getConnection } from 'typeorm'
import { Doot } from '../entities/Doot'
import { Post } from '../entities/Post'
import { isAuth } from '../middleware/isAuth'
import { MyContext } from '../types'

// for creating a post
@InputType()
class PostInput {
  @Field()
  title: string
  @Field()
  text: string
}

// what posts query will return
@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[]
  @Field()
  hasMore: boolean
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50)
  }

  // get a up to limit amount of posts
  @Query(() => PaginatedPosts)
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req }: MyContext
  ): Promise<PaginatedPosts> {
    const userId = req.session.userId
    const realLimit = Math.min(50, limit)
    const realLimitPlusOne = realLimit + 1

    const replacements: any[] = [realLimitPlusOne]

    if (userId) {
      replacements.push(userId)
    }

    let cursorIndex = 3
    if (cursor) {
      replacements.push(new Date(parseInt(cursor)))
      cursorIndex = replacements.length
    }

    const posts = await getConnection().query(
      `
    select p.*, 
    json_build_object(
      'id', u.id,
      'username', u.username,
      'email', u.email,
      'createdAt', u."createdAt",
      'updatedAt', u."updatedAt"
    ) creator,
    ${
      userId
        ? `(select value from doot where "userId" = $2 and "postId" = p.id) "dootStatus"`
        : `null as "dootStatus"`
    }
    from post p
    inner join public.user u on u.id = p."creatorId"
    ${cursor ? `where p."createdAt" < $${cursorIndex}` : ''}
    order by p."createdAt" DESC
    limit $1
    `,
      replacements
    )

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne
    }
  }

  // get single post by id
  @Query(() => Post, { nullable: true })
  post(@Arg('id') id: number): Promise<Post | undefined> {
    return Post.findOne(id)
  }

  // create a post
  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg('input') input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({ ...input, creatorId: req.session.userId }).save()
  }

  // update a post
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id') id: number,
    @Arg('title') title: string
  ): Promise<Post | null> {
    const post = await Post.findOne(id)

    if (!post) {
      return null
    }

    if (typeof title !== 'undefined') {
      await Post.update({ id }, { title })
    }

    return post
  }

  // upvote/downvote a post
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async doot(
    @Arg('postId', () => Int) postId: number,
    @Arg('value', () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const userId = req.session.userId

    const doot = await Doot.findOne({ where: { postId, userId } })

    // prevent vote manipulation
    const isUpdoot = value >= 1
    const realValue = isUpdoot ? 1 : -1

    if (doot && doot.value !== realValue) {
      // user is changing their doot
      getConnection().transaction(async (tm) => {
        await tm.query(
          `
        update doot
        set value = $1
        where "postId" = $2 and "userId" = $3
          `,
          [realValue, postId, userId]
        )
        await tm.query(
          `
        update post
        set points = points + $1
        where id = $2
        `,
          [2 * realValue, postId]
        )
      })
    } else if (!doot) {
      // user has not dooted yet
      getConnection().transaction(async (tm) => {
        await tm.query(
          `
      insert into doot ("userId", "postId", value)
      values ($1,$2,$3)
        `,
          [userId, postId, realValue]
        )

        await tm.query(
          `
        update post
        set points = points + $1
        where id = $2
        `,
          [realValue, postId]
        )
      })
    }

    return true
  }

  // delete a post
  @Mutation(() => Boolean)
  async deletePost(@Arg('id') id: number): Promise<boolean> {
    await Post.delete(id)
    return true
  }
}
