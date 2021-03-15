import { Button, Spinner, Text } from '@chakra-ui/react'
import { withUrqlClient } from 'next-urql'
import Link from 'next/link'
import { Layout } from '../components/Layout'
import { usePostsQuery } from '../generated/graphql'
import { createUrqlClient } from '../utils/createUrqlClient'

const Index = () => {
  const [{ data }] = usePostsQuery()

  return (
    <Layout>
      <Link href='/create-post'>
        <Button justifySelf='end'>Create a post</Button>
      </Link>
      {!data ? (
        <Spinner />
      ) : (
        data.posts.map((p) => <Text key={p.id}>{p.title}</Text>)
      )}
    </Layout>
  )
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Index)
