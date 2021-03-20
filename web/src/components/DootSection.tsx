import { ApolloCache } from '@apollo/client'
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons'
import { IconButton, Stack, Text } from '@chakra-ui/react'
import {
  DootMutation,
  PostSnippetFragment,
  useDootMutation
} from '@generated/graphql'
import gql from 'graphql-tag'
import React, { useState } from 'react'

interface DootSection {
  post: PostSnippetFragment
}

const updateAfterDoot = (
  value: number,
  postId: number,
  cache: ApolloCache<DootMutation>
) => {
  const data = cache.readFragment<{
    id: number
    points: number
    dootStatus: number | null
  }>({
    id: `Post:${postId}`,
    fragment: gql`
      fragment _ on Post {
        id
        points
        dootStatus
      }
    `
  })
  if (data) {
    if (data.dootStatus === value) return
    const newPoints =
      (data.points as number) + (!data.dootStatus ? 1 : 2) * value
    cache.writeFragment({
      id: `Post:${postId}`,
      fragment: gql`
        fragment _ on Post {
          points
          dootStatus
        }
      `,
      data: { points: newPoints, dootStatus: value }
    })
  }
}

export const DootSection: React.FC<DootSection> = ({ post }) => {
  const [doot] = useDootMutation()
  const [loading, setLoading] = useState<'updoot' | 'downdoot' | 'not'>('not')

  return (
    <Stack h='full' justify='start' align='center'>
      <IconButton
        aria-label='updoot post'
        icon={<TriangleUpIcon />}
        size='xs'
        color={post.dootStatus === 1 ? 'orange.500' : 'gray.500'}
        borderRadius='sm'
        _hover={{ color: 'orange.500', bg: 'gray.100' }}
        variant='ghost'
        onClick={async () => {
          if (post.dootStatus === 1) return
          setLoading('updoot')
          await doot({
            variables: {
              postId: post.id,
              value: 1
            },
            update: (cache) => updateAfterDoot(1, post.id, cache)
          })
          setLoading('not')
        }}
        isLoading={loading === 'updoot'}
      />
      <Text fontSize='xs' fontWeight='semibold' color='gray.500' lineHeight={0}>
        {post.points}
      </Text>
      <IconButton
        aria-label='downdoot post'
        icon={<TriangleDownIcon />}
        size='xs'
        borderRadius='sm'
        color={post.dootStatus === -1 ? 'blue.500' : 'gray.500'}
        _hover={{ color: 'blue.500', bg: 'gray.100' }}
        variant='ghost'
        onClick={async () => {
          if (post.dootStatus === -1) return
          setLoading('downdoot')
          await doot({
            variables: {
              postId: post.id,
              value: -1
            },
            update: (cache) => updateAfterDoot(-1, post.id, cache)
          })
          setLoading('not')
        }}
        isLoading={loading === 'downdoot'}
      />
    </Stack>
  )
}
