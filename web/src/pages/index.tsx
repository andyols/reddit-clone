import {
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  Link as ChakraLink,
  Stack,
  Text
} from '@chakra-ui/react'
import { DootSection } from '@components/DootSection'
import { ErrorAlert } from '@components/ErrorAlert'
import { Layout } from '@components/Layout'
import { Loader } from '@components/Loader'
import { PostActionsMenu } from '@components/PostActionsMenu'
import { useMeQuery, usePostsQuery } from '@generated/graphql'
import { withApollo } from '@utils/withApollo'
import Link from 'next/link'
import React from 'react'

const Index = () => {
  const { data, error, loading, fetchMore, variables } = usePostsQuery({
    variables: {
      limit: 10,
      cursor: null
    },
    notifyOnNetworkStatusChange: true
  })
  const { data: meData } = useMeQuery()

  // query failed for some reason
  if (!data && !loading) {
    return <ErrorAlert message={error?.message} />
  }

  // data has not been resolved yet
  if (!data && loading) {
    return <Loader />
  }

  return (
    <Layout>
      <Stack spacing={2} as='header'>
        <Heading size='lg'>Latest Posts</Heading>
        <Divider mb={4} />
      </Stack>
      <Stack spacing={4} as='section'>
        {data!.posts.posts.map((p) =>
          !p ? null : (
            <HStack
              as='article'
              justify='space-between'
              key={p.id}
              p={5}
              shadow='xs'
              bg='white'
              borderRadius='base'
            >
              <HStack>
                <DootSection post={p} />
                <Stack spacing={0} alignSelf='start'>
                  <Text color='gray.500' fontSize='sm'>
                    posted by @{p.creator.username} {}
                  </Text>
                  <Link href={`/post/${p.id}`}>
                    <Heading as={ChakraLink} fontSize='xl'>
                      {p.title}
                    </Heading>
                  </Link>
                  {p.textSnippet && <Text mt={4}>{p.textSnippet} ...</Text>}
                </Stack>
              </HStack>

              {meData?.me?.id === p.creator.id && (
                <Flex alignSelf='start'>
                  <PostActionsMenu id={p.id} />
                </Flex>
              )}
            </HStack>
          )
        )}
      </Stack>
      {data && data.posts.hasMore && (
        <Flex>
          <Button
            colorScheme='blue'
            isLoading={loading}
            m='auto'
            my={8}
            isDisabled={!data.posts.hasMore}
            onClick={() => {
              fetchMore({
                variables: {
                  limit: variables?.limit,
                  cursor:
                    data.posts.posts[data.posts.posts.length - 1].createdAt
                }
              })
            }}
          >
            Load More
          </Button>
        </Flex>
      )}
    </Layout>
  )
}

export default withApollo({ ssr: true })(Index)
