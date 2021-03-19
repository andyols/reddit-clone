import { useMeQuery } from '@generated/graphql'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export const useAuthRedirect = () => {
  const router = useRouter()
  const { data, loading } = useMeQuery()

  useEffect(() => {
    if (!data?.me && !loading) {
      router.replace(`/login?next=${router.pathname}`)
    }
  }, [data, loading, router])
}
