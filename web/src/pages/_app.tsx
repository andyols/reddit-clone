import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'
import { ChakraProvider } from '@chakra-ui/react'
import theme from '@theme'
import { AppProps } from 'next/app'

const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_API_URL as string,
  credentials: 'include',
  cache: new InMemoryCache()
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </ApolloProvider>
  )
}

export default MyApp
