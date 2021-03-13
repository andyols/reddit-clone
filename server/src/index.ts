import { MikroORM } from '@mikro-orm/core'
import { ApolloServer } from 'apollo-server-express'
import connectRedis from 'connect-redis'
import 'dotenv-safe/config'
import express from 'express'
import session from 'express-session'
import redis from 'redis'
import 'reflect-metadata'
import { buildSchema } from 'type-graphql'
import { _COOKIE_NAME_, _PROD_ } from './constants'
import mikroConfig from './mikro-orm.config'
import { HelloResolver } from './resolvers/hello'
import { PostResolver } from './resolvers/post'
import { UserResolver } from './resolvers/user'

const main = async () => {
  // connect to db
  const orm = await MikroORM.init(mikroConfig)

  // run migrations
  try {
    await orm.getMigrator().up()
  } catch {
    console.error('check postgresql service')
  }

  // initialize express
  const app = express()

  // redis setup
  const RedisStore = connectRedis(session)
  const redisClient = redis.createClient()

  // express-session setup
  app.use(
    session({
      name: _COOKIE_NAME_,
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
        disableTTL: true
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true, // frontend js cannot access cookie
        secure: _PROD_, // cookie only works in https
        sameSite: 'lax' // protect csrf
      },
      secret: process.env.SESSION_KEY!,
      saveUninitialized: false,
      resave: false
    })
  )

  // setup apollo
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false
    }),
    context: ({ req, res }) => ({ em: orm.em, req, res })
  })
  apolloServer.applyMiddleware({ app })

  const port = process.env.PORT
  app.listen(port, () => {
    console.log(`server started on localhost:${port}`)
  })
}

main()
