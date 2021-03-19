import { Button, Stack } from '@chakra-ui/react'
import { InputField } from '@components/InputField'
import { Wrapper } from '@components/Wrapper'
import { useChangePasswordMutation } from '@generated/graphql'
import { stringOrThis } from '@utils/stringOrThis'
import { toErrorMap } from '@utils/toErrorMap'
import { Form, Formik } from 'formik'
import { NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
import NextLink from 'next/link'
import React, { useState } from 'react'

const ChangePassword: NextPage = () => {
  const router = useRouter()
  const [changePassword] = useChangePasswordMutation()
  const [tokenError, setTokenError] = useState('')

  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ newPassword: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({
            variables: {
              newPassword: values.newPassword,
              token: stringOrThis(router.query.token, '')
            }
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
              otherError={tokenError}
            />
            {tokenError && (
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
            )}
            <Button
              type='submit'
              colorScheme='whatsapp'
              isLoading={isSubmitting}
            >
              Submit
            </Button>
          </Stack>
        )}
      </Formik>
    </Wrapper>
  )
}

export default ChangePassword
