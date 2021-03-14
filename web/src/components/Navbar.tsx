import { Button, Flex, HStack } from '@chakra-ui/react'
import NextLink from 'next/link'
import React from 'react'
import { useLogoutMutation, useMeQuery } from '../generated/graphql'
import { isServer } from '../utils/isServer'

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = ({}) => {
  const [{ data, fetching }] = useMeQuery({ pause: isServer() })
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation()

  let body = null
  if (fetching) {
    // user data loading
  } else if (!data?.me) {
    // user not logged in
    body = (
      <>
        <NextLink href='/login'>
          <Button variant='link' color='gray.100'>
            login
          </Button>
        </NextLink>
        <NextLink href='/register'>
          <Button variant='link' color='gray.100'>
            register
          </Button>
        </NextLink>
      </>
    )
  } else {
    // user is logged in
    body = (
      <>
        <Button variant='link' color='gray.100'>
          {data.me.username}
        </Button>
        <Button
          variant='link'
          color='gray.100'
          onClick={() => logout()}
          isLoading={logoutFetching}
        >
          logout
        </Button>
      </>
    )
  }

  return (
    <Flex bg='blue.500' p={4}>
      <HStack ml='auto' color='gray.100'>
        {body}
      </HStack>
    </Flex>
  )
}
