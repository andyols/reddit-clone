import { useMeQuery } from '@generated/graphql'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export const useAuthRedirect = () => {
  const router = useRouter()
  const [{ data, fetching }] = useMeQuery()

  useEffect(() => {
    if (!data?.me && !fetching) {
      router.replace(`/login?next=${router.pathname}`)
    }
  }, [data, fetching, router])
}
