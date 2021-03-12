import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import { Post } from '../entities/Post'
import { MyContext } from '../types'

@Resolver()
export class PostResolver {
  // get all posts
  @Query(() => [Post])
  posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    return em.find(Post, {})
  }

  // get single post by id
  @Query(() => Post, { nullable: true })
  post(@Arg('id') id: number, @Ctx() { em }: MyContext): Promise<Post | null> {
    return em.findOne(Post, { id })
  }

  // create a post
  @Mutation(() => Post)
  async createPost(
    @Arg('title') title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    const post = em.create(Post, { title })
    await em.persistAndFlush(post)
    return em.findOne(Post, { title })
  }

  // update a post
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id') id: number,
    @Arg('title') title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    const post = await em.findOne(Post, { id })

    if (!post) {
      return null
    }

    if (typeof title !== 'undefined') {
      post.title = title
      await em.persistAndFlush(post)
    }

    return post
  }

  // delete a post
  @Mutation(() => Boolean)
  async deletePost(
    @Arg('id') id: number,
    @Ctx() { em }: MyContext
  ): Promise<boolean> {
    await em.nativeDelete(Post, { id })
    return true
  }
}
