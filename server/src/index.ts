import { MikroORM } from '@mikro-orm/core'
import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import { buildSchema } from 'type-graphql'
import mikroConfig from './mikro-orm.config'
import { HelloResolver } from './resolvers/hello'

const main = async () => {
  // connect to db
  const orm = await MikroORM.init(mikroConfig)

  // run migrations
  await orm.getMigrator().up()

  // initialize express
  const app = express()

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver],
      validate: false
    })
  })

  apolloServer.applyMiddleware({ app })

  app.listen(4000, () => {
    console.log('server started on localhost:4000')
  })
}

main()

console.log('hello, world!!!')
