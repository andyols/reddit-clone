import { Button, Stack } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import { useRouter } from 'next/dist/client/router'
import React from 'react'
import { InputField } from '../components/InputField'
import { Wrapper } from '../components/Wrapper'
import { useRegisterMutation } from '../generated/graphql'
import { toErrorMap } from '../utils/toErrorMap'

interface registerProps {}

const Register: React.FC<registerProps> = ({}) => {
  const router = useRouter()
  const [, register] = useRegisterMutation()

  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await register(values)

          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors))
          } else if (response.data?.register.user) {
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
              Register
            </Button>
          </Stack>
        )}
      </Formik>
    </Wrapper>
  )
}

export default Register
