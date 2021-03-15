import { EntityManager } from '@mikro-orm/postgresql'
import argon2 from 'argon2'
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver
} from 'type-graphql'
import { v4 } from 'uuid'
import { _COOKIE_NAME_, __FORGET_PASSWORD_PREFIX } from '../constants'
import { User } from '../entities/User'
import { MyContext } from '../types'
import { sendEmail } from '../utils/sendEmail'
import { validateRegister } from '../utils/validateRegister'
import { UserOptions } from './UserOptions'

// error object to user in UserReponse
@ObjectType()
class FieldError {
  @Field()
  field: string

  @Field()
  message: string
}

// what mutations will return
@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]

  @Field(() => User, { nullable: true })
  user?: User
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() { redis, em, req }: MyContext
  ): Promise<UserResponse> {
    // validate password
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: 'newPassword',
            message: 'length must be greater than 2'
          }
        ]
      }
    }

    // lookup and fetch user in redis
    const key = __FORGET_PASSWORD_PREFIX + token
    const userId = await redis.get(key)

    if (!userId) {
      // if token has expired
      return {
        errors: [
          {
            field: 'token',
            message: 'token expired'
          }
        ]
      }
    }

    const user = await em.findOne(User, { id: parseInt(userId) })

    if (!user) {
      // if user associated with this token was deleted
      return {
        errors: [
          {
            field: 'token',
            message: 'user no longer exists'
          }
        ]
      }
    }

    user.password = await argon2.hash(newPassword)
    await em.persistAndFlush(user)

    // clear token from redis
    await redis.del(key)

    // log in user after change password
    req.session.userId = user.id

    return { user }
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { em, redis }: MyContext
  ) {
    const user = await em.findOne(User, { email })

    if (!user) {
      // did not find email in db
      return true
    }

    const token = v4()

    // store a token in redis
    await redis.set(
      __FORGET_PASSWORD_PREFIX + token,
      user.id,
      'ex',
      1000 * 60 * 60 * 24 * 3
    ) // 3 days

    // attach token to anchor link for frontend processing
    sendEmail(
      email,
      'Change Password',
      `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
    )

    return true
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: MyContext) {
    // get user id from session cookie
    const id = req.session.userId

    // not logged in
    if (!id) {
      return null
    }

    // return user data
    const user = await em.findOne(User, { id })
    return user
  }

  // register a user
  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UserOptions,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options)

    if (errors) {
      return { errors }
    }

    // hash password
    const hashedPassword = await argon2.hash(options.password)

    let user
    try {
      const result = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          email: options.email,
          username: options.username,
          password: hashedPassword,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('*')
      user = result[0]
    } catch (err) {
      if (err.code === '23505') {
        // duplicate username
        return {
          errors: [
            {
              field: 'username',
              message: 'that username already exists'
            }
          ]
        }
      }
    }

    // persist user in session cookie
    req.session.userId = user.id

    return { user }
  }

  // login a user
  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    // check for user
    const user = await em.findOne(
      User,
      usernameOrEmail.includes('@')
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail }
    )
    if (!user) {
      return {
        errors: [
          {
            field: 'usernameOrEmail',
            message: "that user doesn't exist"
          }
        ]
      }
    }

    // verify password
    const validPassword = await argon2.verify(user.password, password)
    if (!validPassword) {
      return {
        errors: [
          {
            field: 'password',
            message: 'incorrect password'
          }
        ]
      }
    }

    // persist user in session cookie
    req.session.userId = user.id

    return { user }
  }

  // logout the user
  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    // clear session from redis server
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        if (err) {
          console.log(err)
          resolve(false)
        }

        // clear the cookie
        res.clearCookie(_COOKIE_NAME_)
        resolve(true)
      })
    )
  }
}
