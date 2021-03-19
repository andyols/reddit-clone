import { Divider, Heading, HStack, Stack, Text } from '@chakra-ui/react'
import { ErrorAlert } from '@components/ErrorAlert'
import { Layout } from '@components/Layout'
import { Loader } from '@components/Loader'
import { PostActionsMenu } from '@components/PostActionsMenu'
import { usePostQuery } from '@generated/graphql'
import { usePostIdFromUrl } from '@utils/usePostIdFromUrl'
import { withApollo } from '@utils/withApollo'
import React from 'react'

export const Post = ({}) => {
  const id = usePostIdFromUrl()
  const { data, error, loading } = usePostQuery({
    skip: id === -1, // bad url param, dont bother with request
    variables: {
      id
    }
  })

  // post query failed for some reason
  if (!loading && error) {
    return <ErrorAlert message={error.message} />
  }

  // post data has not been resolved yet
  if (loading || !data?.post) {
    return <Loader />
  }

  return (
    <Layout>
      <Stack>
        <HStack justify='space-between'>
          <Heading>{data.post.title}</Heading>
          <PostActionsMenu id={id} />
        </HStack>
        <Divider />
        <Text>{data.post.text}</Text>
      </Stack>
    </Layout>
  )
}

export default withApollo({ ssr: true })(Post)
