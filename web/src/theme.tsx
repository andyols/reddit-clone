import { extendTheme } from '@chakra-ui/react'

const styles = {
  global: () => ({
    html: {
      minW: 'xs',
      scrollBehavior: 'smooth'
    },
    body: {
      bg: 'gray.50'
    }
  })
}

const theme = extendTheme({
  styles
})

export default theme
