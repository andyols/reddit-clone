import { Button, Stack } from '@chakra-ui/react'
import { InputField } from '@components/InputField'
import { Wrapper } from '@components/Wrapper'
import { useLoginMutation } from '@generated/graphql'
import { stringOrThis } from '@utils/stringOrThis'
import { toErrorMap } from '@utils/toErrorMap'
import { withApollo } from '@utils/withApollo'
import { Form, Formik } from 'formik'
import { useRouter } from 'next/dist/client/router'
import NextLink from 'next/link'
import React from 'react'

const Login: React.FC<{}> = ({}) => {
  const router = useRouter()
  const [login] = useLoginMutation()

  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ usernameOrEmail: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login({ variables: values })
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors))
          } else if (response.data?.login.user) {
            // yay, it worked
            // redirect user
            router.push(stringOrThis(router.query.next, '/'))
          }
        }}
      >
        {({ isSubmitting }) => (
          <Stack as={Form} spacing={4}>
            <InputField
              name='usernameOrEmail'
              placeholder='username or email'
              label='Username or Email'
            />
            <InputField
              name='password'
              placeholder='password'
              label='Password'
              type='password'
            />
            <NextLink href='/forgot-password'>
              <Button
                as='a'
                colorScheme='blue'
                variant='link'
                alignSelf='flex-end'
              >
                Forgot password?
              </Button>
            </NextLink>
            <Button
              type='submit'
              colorScheme='whatsapp'
              isLoading={isSubmitting}
            >
              Login
            </Button>
          </Stack>
        )}
      </Formik>
    </Wrapper>
  )
}

export default withApollo({ ssr: false })(Login)
