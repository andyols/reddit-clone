import {
  Icon,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal
} from '@chakra-ui/react'
import { useDeletePostMutation } from '@generated/graphql'
import React from 'react'
import { FiEdit, FiMoreVertical, FiTrash } from 'react-icons/fi'

interface PostActionsMenuProps {
  id: number
}

export const PostActionsMenu: React.FC<PostActionsMenuProps> = ({ id }) => {
  const [deletePost] = useDeletePostMutation()

  return (
    <Menu placement='left-start'>
      <MenuButton
        color='gray.700'
        transition='ease-in-out 0.15s'
        _hover={{
          cursor: 'pointer',
          color: 'blue.500'
        }}
        aria-label='Post Actions'
      >
        <Icon as={FiMoreVertical} w={5} h={5} />
      </MenuButton>
      <Portal>
        <MenuList>
          <Link href={`/post/${id}/edit`}>
            <MenuItem>
              <Icon as={FiEdit} mr={2} />
              Edit Post
            </MenuItem>
          </Link>
          <MenuItem
            _hover={{
              color: 'red.500'
            }}
            _focus={{
              color: 'red.500',
              bg: 'gray.100'
            }}
            onClick={() =>
              deletePost({
                variables: { id },
                update: (cache) => {
                  cache.evict({ id: `Post:${id}` })
                }
              })
            }
          >
            <Icon as={FiTrash} mr={2} />
            Delete Post
          </MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  )
}
