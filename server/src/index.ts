import { MikroORM } from '@mikro-orm/core'
import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import 'reflect-metadata'
import { buildSchema } from 'type-graphql'
import mikroConfig from './mikro-orm.config'
import { HelloResolver } from './resolvers/hello'
import { PostResolver } from './resolvers/post'

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

  // setup apollo
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver],
      validate: false
    }),
    context: () => ({ em: orm.em })
  })
  apolloServer.applyMiddleware({ app })

  const port = process.env.PORT
  app.listen(port, () => {
    console.log(`server started on localhost:${port}`)
  })
}

main()
