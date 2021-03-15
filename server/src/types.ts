import {
  Connection,
  EntityManager,
  IDatabaseDriver
} from '.pnpm/@mikro-orm/core@4.4.4_fe5b60a86d3c153f6d462e84e631b102/node_modules/@mikro-orm/core'
import { Request, Response } from 'express'
import { Session, SessionData } from 'express-session'
import { Redis } from 'ioredis'

export type MyContext = {
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>
  req: Request & {
    session: Session & Partial<SessionData> & { userId: number }
  }
  redis: Redis
  res: Response
}
