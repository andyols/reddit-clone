import { Button, Stack } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import React from 'react'
import { useMutation } from 'urql'
import { InputField } from '../components/InputField'
import { Wrapper } from '../components/Wrapper'

interface registerProps {}

const REGISTER_MUT = `
mutation Register($username: String!, $password: String!) {
  register(options: { username: $username, password: $password }) {
    errors {
      field
      message
    }
    user {
      id
      username
    }
  }
}
`

const Register: React.FC<registerProps> = ({}) => {
  const [, register] = useMutation(REGISTER_MUT)
  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={(values) => {
          return register(values)
        }}
      >
        {({ isSubmitting }) => (
          <Stack as={Form} spacing={4}>
            <InputField
              name='username'
              placeholder='username'
              label='Username'
            />
            <InputField
              name='password'
              placeholder='password'
              label='Password'
              type='password'
            />
            <Button type='submit' colorScheme='teal' isLoading={isSubmitting}>
              Register
            </Button>
          </Stack>
        )}
      </Formik>
    </Wrapper>
  )
}

export default Register
