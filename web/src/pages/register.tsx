import { Button, Stack } from '@chakra-ui/react'
import { InputField } from '@components/InputField'
import { Wrapper } from '@components/Wrapper'
import { MeDocument, MeQuery, useRegisterMutation } from '@generated/graphql'
import { toErrorMap } from '@utils/toErrorMap'
import { withApollo } from '@utils/withApollo'
import { Form, Formik } from 'formik'
import { useRouter } from 'next/dist/client/router'
import React from 'react'

interface registerProps {}

const Register: React.FC<registerProps> = ({}) => {
  const router = useRouter()
  const [register] = useRegisterMutation()

  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ email: '', username: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await register({
            variables: { options: values },
            update: (cache, { data }) => {
              cache.writeQuery<MeQuery>({
                query: MeDocument,
                data: {
                  __typename: 'Query',
                  me: data?.register.user
                }
              })
            }
          })

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
              name='email'
              placeholder='email'
              label='Email'
              type='email'
            />
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
            <Button
              type='submit'
              colorScheme='whatsapp'
              isLoading={isSubmitting}
            >
              Register
            </Button>
          </Stack>
        )}
      </Formik>
    </Wrapper>
  )
}

export default withApollo({ ssr: false })(Register)
