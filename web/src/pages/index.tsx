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
import React from 'react'
import { Layout } from '../components/Layout'
import { usePostsQuery } from '../generated/graphql'
import { createUrqlClient } from '../utils/createUrqlClient'

const Index = () => {
  const [{ data, fetching }] = usePostsQuery({
    variables: {
      limit: 10
    }
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
          {data!.posts.map((p) => (
            <Box
              key={p.id}
              p={5}
              shadow='md'
              borderWidth='1px'
              borderRadius='base'
            >
              <Heading fontSize='xl'>{p.title}</Heading>
              <Text mt={4}>{p.textSnippet} ...</Text>
            </Box>
          ))}
          {data && (
            <Flex pt={2} pb={6}>
              <Button colorScheme='blue' isLoading={fetching} m='auto'>
                Load More
              </Button>
            </Flex>
          )}
        </Stack>
      )}
    </Layout>
  )
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Index)
