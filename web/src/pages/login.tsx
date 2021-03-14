import { Button, Stack } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import { withUrqlClient } from 'next-urql'
import { useRouter } from 'next/dist/client/router'
import React from 'react'
import { InputField } from '../components/InputField'
import { Wrapper } from '../components/Wrapper'
import { useLoginMutation } from '../generated/graphql'
import { createUrqlClient } from '../utils/createUrqlClient'
import { toErrorMap } from '../utils/toErrorMap'

const Login: React.FC<{}> = ({}) => {
  const router = useRouter()
  const [, login] = useLoginMutation()

  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login({ options: values })

          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors))
          } else if (response.data?.login.user) {
            // yay, it worked
            router.push('/')
          }
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
              Login
            </Button>
          </Stack>
        )}
      </Formik>
    </Wrapper>
  )
}

export default withUrqlClient(createUrqlClient)(Login)
