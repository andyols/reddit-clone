import DataLoader from 'dataloader'
import { User } from '../entities/User'

export const createUserLoader = () =>
  new DataLoader<number, User>(async (keys) => {
    const userIdToUser: Record<number, User> = {}

    const users = await User.findByIds(keys as number[])

    users.forEach((u) => {
      userIdToUser[u.id] = u
    })

    return keys.map((ui) => userIdToUser[ui])
  })
