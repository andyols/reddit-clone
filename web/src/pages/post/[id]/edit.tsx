import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  Spinner,
  Stack
} from '@chakra-ui/react'
import { InputField } from '@components/InputField'
import { Layout } from '@components/Layout'
import { TextareaField } from '@components/TextareaField'
import { usePostQuery, useUpdatePostMutation } from '@generated/graphql'
import { createUrqlClient } from '@utils/createUrqlClient'
import { usePostIdFromUrl } from '@utils/usePostIdFromUrl'
import { Form, Formik } from 'formik'
import { withUrqlClient } from 'next-urql'
import { useRouter } from 'next/router'
import React from 'react'

const EditPost = () => {
  const router = useRouter()
  const id = usePostIdFromUrl()
  const [{ data, fetching }] = usePostQuery({
    pause: id === -1, // bad url param, dont bother with request
    variables: {
      id
    }
  })
  const [, updatePost] = useUpdatePostMutation()

  if (fetching) {
    return (
      <Layout>
        <Spinner />
      </Layout>
    )
  }

  if (!data?.post) {
    return (
      <Layout>
        <Alert status='error' borderRadius='base'>
          <AlertIcon />
          <AlertTitle mr={2}>Whoopsie!</AlertTitle>
          <AlertDescription>We couldn't find that post.</AlertDescription>
        </Alert>
      </Layout>
    )
  }

  return (
    <Layout variant='small'>
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={async (values) => {
          await updatePost({ id, ...values })
          router.back()
        }}
      >
        {({ isSubmitting }) => (
          <Stack as={Form} spacing={4}>
            <InputField name='title' placeholder='Title' label='Title' />
            <TextareaField
              name='text'
              placeholder='What do you have to say?'
              label='Body'
            />
            <Button
              type='submit'
              colorScheme='whatsapp'
              isLoading={isSubmitting}
            >
              Update Post
            </Button>
          </Stack>
        )}
      </Formik>
    </Layout>
  )
}

export default withUrqlClient(createUrqlClient)(EditPost)
