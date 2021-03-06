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
import { User } from '../entities/User'
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
  // field resolvers will only run if it is included in the gql request
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50)
  }

  // get the creator of a post no matter the origin of the request
  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(post.creatorId)
  }

  // get the doot status of a post no matter the origin of the request
  @FieldResolver(() => Int, { nullable: true })
  async dootStatus(@Root() post: Post, @Ctx() { dootLoader, req }: MyContext) {
    // can't have a vote status if you are not logged in
    if (!req.session.userId) {
      return null
    }

    const doot = await dootLoader.load({
      postId: post.id,
      userId: req.session.userId
    })

    return doot ? doot.value : null
  }

  // get a up to limit amount of posts
  @Query(() => PaginatedPosts)
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit)
    const realLimitPlusOne = realLimit + 1

    const replacements: any[] = [realLimitPlusOne]

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)))
    }

    const posts = await getConnection().query(
      `
    select p.*
    from post p
    ${cursor ? `where p."createdAt" < $2` : ''}
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
  post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
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
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('title') title: string,
    @Arg('text') text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id = :id and "creatorId" = :creatorId', {
        id,
        creatorId: req.session.userId
      })
      .returning('*')
      .execute()

    return result.raw[0]
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
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg('id', () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    // more explicit delete flow that does not use CASCADE in doot entity
    // const post = await Post.findOne(id)

    // if (!post) return false

    // if (post?.creatorId !== req.session.userId) {
    //   throw new Error('not authorized')
    // }

    // await Doot.delete({ postId: id })
    // await Post.delete({ id })

    await Post.delete({ id, creatorId: req.session.userId })

    return true
  }
}
