import { Button, Stack } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import { NextPage } from 'next'
import { withUrqlClient } from 'next-urql'
import { useRouter } from 'next/dist/client/router'
import NextLink from 'next/link'
import React, { useState } from 'react'
import { InputField } from '../../components/InputField'
import { Wrapper } from '../../components/Wrapper'
import { useChangePasswordMutation } from '../../generated/graphql'
import { createUrqlClient } from '../../utils/createUrqlClient'
import { toErrorMap } from '../../utils/toErrorMap'

interface Props {
  token?: string
}

const ChangePassword: NextPage<Props> = ({ token = '' }) => {
  const router = useRouter()
  const [, changePassword] = useChangePasswordMutation()
  const [tokenError, setTokenError] = useState('')

  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ newPassword: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({
            newPassword: values.newPassword,
            token
          })
          if (response.data?.changePassword.errors) {
            const errorMap = toErrorMap(response.data.changePassword.errors)

            if ('token' in errorMap) {
              setTokenError(errorMap.token)
            }

            setErrors(errorMap)
          } else if (response.data?.changePassword.user) {
            // yay, it worked
            router.push('/')
          }
        }}
      >
        {({ isSubmitting }) => (
          <Stack as={Form} spacing={4}>
            <InputField
              name='newPassword'
              placeholder='new password'
              label='New Password'
              type='password'
              aria-invalid={!!tokenError}
              alt={tokenError}
            />
            {tokenError ? (
              <NextLink href='/forgot-password'>
                <Button
                  as='a'
                  colorScheme='blue'
                  variant='link'
                  alignSelf='flex-end'
                >
                  Reset password again
                </Button>
              </NextLink>
            ) : (
              <Button type='submit' colorScheme='teal' isLoading={isSubmitting}>
                Submit
              </Button>
            )}
          </Stack>
        )}
      </Formik>
    </Wrapper>
  )
}

ChangePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string
  }
}

export default withUrqlClient(createUrqlClient)(ChangePassword)
