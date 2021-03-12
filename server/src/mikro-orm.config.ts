import { MikroORM } from '@mikro-orm/core'
import path from 'path'
import { PROD } from './constants'
import { Post } from './entities/Post'

export default {
  migrations: {
    path: path.join(__dirname, './migrations'),
    pattern: /^[\w-]+\d+\.[tj]s$/
  },
  entities: [Post],
  dbName: 'reddit_clone_db',
  type: 'postgresql',
  debug: !PROD
} as Parameters<typeof MikroORM.init>[0] // black-magic ts casting
