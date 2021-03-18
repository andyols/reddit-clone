import { Request, Response } from 'express'
import { Session, SessionData } from 'express-session'
import { Redis } from 'ioredis'
import { createDootLoader } from './utils/createDootLoader'
import { createUserLoader } from './utils/createUserLoader'

export type MyContext = {
  req: Request & {
    session: Session & Partial<SessionData> & { userId: number }
  }
  redis: Redis
  res: Response
  userLoader: ReturnType<typeof createUserLoader>
  dootLoader: ReturnType<typeof createDootLoader>
}
