import { Button, Stack } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import React from 'react'
import { InputField } from '../components/InputField'
import { Wrapper } from '../components/Wrapper'

interface registerProps {}

const Register: React.FC<registerProps> = ({}) => {
  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={(value) => {
          console.log(value)
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
