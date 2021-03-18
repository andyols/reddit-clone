import DataLoader from 'dataloader'
import { Doot } from '../entities/Doot'

export const createDootLoader = () =>
  new DataLoader<{ postId: number; userId: number }, Doot | null>(
    async (keys) => {
      const dootIdToDoot: Record<string, Doot> = {}

      const doots = await Doot.findByIds(keys as any)

      doots.forEach((d) => {
        dootIdToDoot[`${d.userId}|${d.postId}`] = d
      })

      return keys.map((k) => dootIdToDoot[`${k.userId}|${k.postId}`])
    }
  )
