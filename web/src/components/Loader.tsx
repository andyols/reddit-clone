import { Spinner } from '@chakra-ui/react'
import React from 'react'
import { Layout } from './Layout'

export const Loader = () => {
  return (
    <Layout>
      <Spinner
        alignSelf='center'
        size='xl'
        thickness='6px'
        speed='0.6s'
        color='var(--chakra-colors-messenger-600)'
      />
    </Layout>
  )
}
