import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons'
import { IconButton, Stack, Text } from '@chakra-ui/react'
import React, { useState } from 'react'
import { PostSnippetFragment, useDootMutation } from '../generated/graphql'

interface DootSection {
  post: PostSnippetFragment
}

export const DootSection: React.FC<DootSection> = ({ post }) => {
  const [, doot] = useDootMutation()
  const [loading, setLoading] = useState<'updoot' | 'downdoot' | 'not'>('not')

  return (
    <Stack h='full' justify='start' align='center'>
      <IconButton
        aria-label='updoot post'
        icon={<TriangleUpIcon />}
        size='xs'
        color='gray.500'
        borderRadius='sm'
        _hover={{ color: 'orange.500', bg: 'gray.100' }}
        variant='ghost'
        onClick={async () => {
          setLoading('updoot')
          await doot({
            postId: post.id,
            value: 1
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
        color='gray.500'
        _hover={{ color: 'blue.500', bg: 'gray.100' }}
        variant='ghost'
        onClick={async () => {
          setLoading('downdoot')
          await doot({
            postId: post.id,
            value: -1
          })
          setLoading('not')
        }}
        isLoading={loading === 'downdoot'}
      />
    </Stack>
  )
}
