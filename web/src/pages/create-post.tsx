import { Button, Stack } from '@chakra-ui/react'
import { InputField } from '@components/InputField'
import { Layout } from '@components/Layout'
import { TextareaField } from '@components/TextareaField'
import { useCreatePostMutation } from '@generated/graphql'
import { useAuthRedirect } from '@utils/useAuthRedirect'
import { withApollo } from '@utils/withApollo'
import { Form, Formik } from 'formik'
import { useRouter } from 'next/dist/client/router'
import React from 'react'

const CreatePost: React.FC<{}> = ({}) => {
  const [createPost] = useCreatePostMutation()
  const router = useRouter()
  useAuthRedirect()

  return (
    <Layout variant='small'>
      <Formik
        initialValues={{ title: '', text: '' }}
        onSubmit={async (values) => {
          const { errors } = await createPost({
            variables: { input: values },
            update: (cache) => {
              cache.evict({ fieldName: 'posts' })
            }
          })

          if (!errors) {
            router.push('/')
          }
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
              Create Post
            </Button>
          </Stack>
        )}
      </Formik>
    </Layout>
  )
}

export default withApollo({ ssr: false })(CreatePost)
