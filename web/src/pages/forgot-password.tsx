import { Button, Stack, Text } from '@chakra-ui/react'
import { InputField } from '@components/InputField'
import { Wrapper } from '@components/Wrapper'
import { useForgotPasswordMutation } from '@generated/graphql'
import { Form, Formik } from 'formik'
import React, { useState } from 'react'

const ForgotPassword: React.FC<{}> = ({}) => {
  const [complete, setComplete] = useState(false)
  const [forgotPassword] = useForgotPasswordMutation()

  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ email: '' }}
        onSubmit={async (values) => {
          await forgotPassword({ variables: values })
          setComplete(true)
        }}
      >
        {({ isSubmitting }) =>
          complete ? (
            <Text>An email has been sent if this account exists 👍</Text>
          ) : (
            <Stack as={Form} spacing={4}>
              <InputField
                name='email'
                placeholder='email'
                label='Email'
                type='email'
              />
              <Button
                type='submit'
                colorScheme='whatsapp'
                isLoading={isSubmitting}
              >
                Submit
              </Button>
            </Stack>
          )
        }
      </Formik>
    </Wrapper>
  )
}

export default ForgotPassword
