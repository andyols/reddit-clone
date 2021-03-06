import { ApolloServer } from 'apollo-server-express'
import connectRedis from 'connect-redis'
import cors from 'cors'
import 'dotenv-safe/config'
import express from 'express'
import session from 'express-session'
import Redis from 'ioredis'
import path from 'path'
import 'reflect-metadata'
import { buildSchema } from 'type-graphql'
import { createConnection } from 'typeorm'
import { __COOKIE_NAME, __PROD } from './constants'
import { Doot } from './entities/Doot'
import { Post } from './entities/Post'
import { User } from './entities/User'
import { HelloResolver } from './resolvers/hello'
import { PostResolver } from './resolvers/post'
import { UserResolver } from './resolvers/user'
import { createDootLoader } from './utils/createDootLoader'
import { createUserLoader } from './utils/createUserLoader'

const main = async () => {
  // connect to db
  const conn = await createConnection({
    type: 'postgres',
    database: 'mokkit_db',
    url: process.env.DATABASE_URL,
    logging: true,
    synchronize: true,
    migrations: [path.join(__dirname, './migrations/*')],
    entities: [User, Post, Doot]
  })

  // run any pending migrations
  await conn.runMigrations()

  // initialize express
  const app = express()

  // redis setup
  const RedisStore = connectRedis(session)
  const redis = new Redis(process.env.REDIS_URL)

  // apply cors to all routes
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true
    })
  )

  // express-session setup
  app.use(
    session({
      name: __COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
        disableTTL: true
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true, // frontend js cannot access cookie
        secure: __PROD, // cookie only works in https
        sameSite: 'lax' // protect csrf
      },
      secret: process.env.SESSION_KEY,
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
    context: ({ req, res }) => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      dootLoader: createDootLoader()
    })
  })
  apolloServer.applyMiddleware({ app, cors: false })

  const port = process.env.PORT
  app.listen(port, () => {
    console.log(`server started on localhost:${port}`)
  })
}

main()
