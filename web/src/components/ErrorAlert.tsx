import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle
} from '@chakra-ui/react'
import React from 'react'
import { Layout } from './Layout'

interface ErrorAlertProps {
  message: string | undefined
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message }) => {
  return (
    <Layout>
      <Alert status='error' borderRadius='base'>
        <AlertIcon />
        <AlertTitle mr={2}>Whoopsie!</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </Layout>
  )
}
