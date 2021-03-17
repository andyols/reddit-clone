import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  Spinner,
  Stack,
  Text
} from '@chakra-ui/react'
import { withUrqlClient } from 'next-urql'
import Link from 'next/link'
import React, { useState } from 'react'
import { Layout } from '../components/Layout'
import { usePostsQuery } from '../generated/graphql'
import { createUrqlClient } from '../utils/createUrqlClient'

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null as string | null
  })

  const [{ data, fetching }] = usePostsQuery({
    variables
  })

  // post query failed for some reason
  if (!fetching && !data) {
    return <Text>Whoopsie!</Text>
  }

  return (
    <Layout>
      <Stack spacing={4}>
        <HStack w='full' justify='space-between'>
          <Heading>New Posts</Heading>
          <Link href='/create-post'>
            <Button justifySelf='end' colorScheme='green'>
              Create a post
            </Button>
          </Link>
        </HStack>
        <Divider mb={8} />
      </Stack>
      {!data && fetching ? (
        <Spinner />
      ) : (
        <Stack spacing={4}>
          {data!.posts.posts.map((p) => (
            <Box key={p.id} p={5} shadow='xs' bg='white' borderRadius='base'>
              <Text color='gray.500' fontSize='sm'>
                posted by @{p.creator.username} {}
              </Text>
              <Heading fontSize='xl'>{p.title}</Heading>
              {p.textSnippet && <Text mt={4}>{p.textSnippet} ...</Text>}
            </Box>
          ))}
        </Stack>
      )}
      {data && data.posts.hasMore && (
        <Flex>
          <Button
            colorScheme='blue'
            isLoading={fetching}
            m='auto'
            my={8}
            isDisabled={!data.posts.hasMore}
            onClick={() => {
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt
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

export default withUrqlClient(createUrqlClient, { ssr: true })(Index)
