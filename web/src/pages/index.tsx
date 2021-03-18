import {
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  Link as ChakraLink,
  Spinner,
  Stack,
  Text
} from '@chakra-ui/react'
import { withUrqlClient } from 'next-urql'
import Link from 'next/link'
import React, { useState } from 'react'
import { DootSection } from '../components/DootSection'
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
      <Stack spacing={2} as='header'>
        <Heading size='lg'>Latest Posts</Heading>
        <Divider mb={4} />
      </Stack>
      {!data && fetching ? (
        <Spinner />
      ) : (
        <Stack spacing={4} as='section'>
          {data!.posts.posts.map((p) => (
            <HStack
              as='article'
              key={p.id}
              p={5}
              shadow='xs'
              bg='white'
              borderRadius='base'
            >
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
