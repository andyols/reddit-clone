import {
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  Link as ChakraLink,
  Spinner,
  Stack,
  Text
} from '@chakra-ui/react'
import { DootSection } from '@components/DootSection'
import { Layout } from '@components/Layout'
import {
  useDeletePostMutation,
  useMeQuery,
  usePostsQuery
} from '@generated/graphql'
import { createUrqlClient } from '@utils/createUrqlClient'
import { withUrqlClient } from 'next-urql'
import Link from 'next/link'
import React, { useState } from 'react'
import { FiDelete } from 'react-icons/fi'

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null as string | null
  })

  const [{ data, fetching }] = usePostsQuery({
    variables
  })

  const [{ data: me }] = useMeQuery()

  const [, deletePost] = useDeletePostMutation()

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
                {me?.me?.id === p.creator.id && (
                  <Icon
                    alignSelf='flex-start'
                    as={FiDelete}
                    color='red.500'
                    _hover={{
                      cursor: 'pointer',
                      color: 'red.700',
                      transform: 'scale(1.1)'
                    }}
                    w={5}
                    h={5}
                    aria-label='Delete Post'
                    onClick={() => deletePost({ id: p.id })}
                  />
                )}
              </HStack>
            )
          )}
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
