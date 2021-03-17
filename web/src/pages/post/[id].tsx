import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Divider,
  Heading,
  Spinner,
  Stack,
  Text
} from '@chakra-ui/react'
import { withUrqlClient } from 'next-urql'
import { useRouter } from 'next/router'
import React from 'react'
import { Layout } from '../../components/Layout'
import { usePostQuery } from '../../generated/graphql'
import { createUrqlClient } from '../../utils/createUrqlClient'

export const Post = ({}) => {
  const router = useRouter()
  const intId =
    typeof router.query.id === 'string' ? parseInt(router.query.id) : -1
  const [{ data, fetching }] = usePostQuery({
    pause: intId === -1, // bad url param, dont bother with request
    variables: {
      id: intId
    }
  })

  if (fetching) {
    return (
      <Layout>
        <Spinner />
      </Layout>
    )
  }

  if (!data?.post) {
    return (
      <Layout>
        <Alert status='error' borderRadius='base'>
          <AlertIcon />
          <AlertTitle mr={2}>Whoopsie!</AlertTitle>
          <AlertDescription>We couldn't find that post.</AlertDescription>
        </Alert>
      </Layout>
    )
  }

  return (
    <Layout>
      <Stack>
        <Heading>{data?.post?.title}</Heading>
        <Divider />
        <Text>{data?.post?.text}</Text>
      </Stack>
    </Layout>
  )
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Post)
