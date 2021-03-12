import argon2 from 'argon2'
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver
} from 'type-graphql'
import { User } from '../entities/User'
import { MyContext } from '../types'

// login/register mutation argument
@InputType()
class UserOptions {
  @Field()
  username: string
  @Field()
  password: string
}

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
  // register a user
  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UserOptions,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    // validate username
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: 'username',
            message: 'length must be greater than 2'
          }
        ]
      }
    }

    // validate password
    if (options.password.length <= 2) {
      return {
        errors: [
          {
            field: 'password',
            message: 'length must be greater than 2'
          }
        ]
      }
    }

    // hash password
    const hashedPassword = await argon2.hash(options.password)
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword
    })

    try {
      await em.persistAndFlush(user)
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
    @Arg('options') options: UserOptions,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    // check for user
    const user = await em.findOne(User, { username: options.username })
    if (!user) {
      return {
        errors: [
          {
            field: 'username',
            message: "that username doesn't exist"
          }
        ]
      }
    }

    // verify password
    const validPassword = await argon2.verify(user.password, options.password)
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

    return { user }
  }
}
