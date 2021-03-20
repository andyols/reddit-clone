import { useApolloClient } from '@apollo/client'
import { Button, Flex, HStack } from '@chakra-ui/react'
import { useLogoutMutation, useMeQuery } from '@generated/graphql'
import { isServer } from '@utils/isServer'
import Link from 'next/link'
import React from 'react'
import { SiteLogo } from './SiteLogo'

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = ({}) => {
  const { data, loading } = useMeQuery({ skip: isServer() })
  const [logout, { loading: logoutLoading }] = useLogoutMutation()
  const apollo = useApolloClient()

  let body = null
  if (loading) {
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
          onClick={async () => {
            await logout()
            await apollo.resetStore()
          }}
          isLoading={logoutLoading}
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
