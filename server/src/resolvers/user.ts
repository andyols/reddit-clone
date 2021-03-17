import argon2 from 'argon2'
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root
} from 'type-graphql'
import { v4 } from 'uuid'
import { __COOKIE_NAME, __FORGET_PASSWORD_PREFIX } from '../constants'
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

@Resolver(User)
export class UserResolver {
  // only return email if this is the current auth user
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    if (req.session.userId === user.id) {
      return user.email
    }
    return ''
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() { redis, req }: MyContext
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

    const userIdNum = parseInt(userId)
    const user = await User.findOne(userIdNum)

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

    await User.update(
      { id: userIdNum },
      { password: await argon2.hash(newPassword) }
    )

    // clear token from redis
    await redis.del(key)

    // log in user after change password
    req.session.userId = user.id

    return { user }
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await User.findOne({ where: { email } })

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
  me(@Ctx() { req }: MyContext) {
    // get user id from session cookie
    const id = req.session.userId

    // not logged in
    if (!id) {
      return null
    }

    // return user data as a promise
    return User.findOne(id)
  }

  // register a user
  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UserOptions,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options)

    if (errors) {
      return { errors }
    }

    // hash password
    const hashedPassword = await argon2.hash(options.password)

    let user
    try {
      user = await User.create({
        email: options.email,
        username: options.username,
        password: hashedPassword
      }).save()

      // persist user in session cookie
      req.session.userId = user.id
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

    return { user }
  }

  // login a user
  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    // check for user
    const user = await User.findOne(
      usernameOrEmail.includes('@')
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
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
        res.clearCookie(__COOKIE_NAME)
        resolve(true)
      })
    )
  }
}
