import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Divider,
  Heading,
  HStack,
  Spinner,
  Stack,
  Text
} from '@chakra-ui/react'
import { Layout } from '@components/Layout'
import { PostActionsMenu } from '@components/PostActionsMenu'
import { createUrqlClient } from '@utils/createUrqlClient'
import { usePostFromUrl } from '@utils/usePostFromUrl'
import { usePostIdFromUrl } from '@utils/usePostIdFromUrl'
import { withUrqlClient } from 'next-urql'
import React from 'react'

export const Post = ({}) => {
  const id = usePostIdFromUrl()
  const [{ data, fetching }] = usePostFromUrl()

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
        <HStack justify='space-between'>
          <Heading>{data?.post?.title}</Heading>
          <PostActionsMenu id={id} />
        </HStack>
        <Divider />
        <Text>{data?.post?.text}</Text>
      </Stack>
    </Layout>
  )
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Post)
