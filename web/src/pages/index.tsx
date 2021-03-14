import { Code, Spinner, Text } from '@chakra-ui/react'
import { withUrqlClient } from 'next-urql'
import { Navbar } from '../components/Navbar'
import { usePostsQuery } from '../generated/graphql'
import { createUrqlClient } from '../utils/createUrqlClient'

const Index = () => {
  const [{ data }] = usePostsQuery()

  return (
    <>
      <Navbar />
      <Text>
        Hello, <Code>Next.js</Code> !
      </Text>
      <br />
      {!data ? (
        <Spinner />
      ) : (
        data.posts.map((p) => <Text key={p.id}>{p.title}</Text>)
      )}
    </>
  )
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Index)
