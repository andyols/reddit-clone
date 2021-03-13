import { MikroORM } from '@mikro-orm/core'
import path from 'path'
import { _PROD_ } from './constants'
import { Post } from './entities/Post'
import { User } from './entities/User'

const config = {
  migrations: {
    path: path.join(__dirname, './migrations'),
    pattern: /^[\w-]+\d+\.[tj]s$/
  },
  entities: [Post, User],
  dbName: 'reddit_clone_db',
  type: 'postgresql',
  debug: !_PROD_
} as Parameters<typeof MikroORM.init>[0] // black-magic ts casting

export default config
