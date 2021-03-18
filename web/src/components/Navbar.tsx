import { Button, Flex, HStack } from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'
import { useLogoutMutation, useMeQuery } from '../generated/graphql'
import { isServer } from '../utils/isServer'
import { SiteLogo } from './SiteLogo'

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
        <Link href='/login'>
          <Button as='a' variant='link' color='gray.100'>
            Login
          </Button>
        </Link>
        <Link href='/register'>
          <Button as='a' variant='link' color='gray.100'>
            Register
          </Button>
        </Link>
      </>
    )
  } else {
    // user is logged in
    body = (
      <>
        <Link href='/create-post'>
          <Button colorScheme='whatsapp'>Create a Post</Button>
        </Link>
        <Button
          as='a'
          variant='link'
          color='gray.50'
          onClick={() => logout()}
          isLoading={logoutFetching}
        >
          Logout
        </Button>
      </>
    )
  }

  return (
    <Flex
      as='nav'
      bg='messenger.600'
      p={4}
      pos='sticky'
      top={0}
      zIndex='docked'
      justify='center'
    >
      <Flex maxW='4xl' w='full' justify='space-between'>
        <SiteLogo />
        <HStack spacing={4} align='center'>
          {body}
        </HStack>
      </Flex>
    </Flex>
  )
}
