import { usePostQuery } from '@generated/graphql'
import { usePostIdFromUrl } from './usePostIdFromUrl'

export const usePostFromUrl = () => {
  const id = usePostIdFromUrl()

  return usePostQuery({
    pause: id === -1, // bad url param, dont bother with request
    variables: {
      id
    }
  })
}
