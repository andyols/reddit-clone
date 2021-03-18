import {
  Box,
  Heading,
  HStack,
  Icon,
  Link as ChakraLink
} from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'
import { HiOutlineClipboardCopy } from 'react-icons/hi'

interface SiteLogoProps {}

export const SiteLogo: React.FC<SiteLogoProps> = ({}) => {
  return (
    <Link href='/'>
      <Box as={ChakraLink} color='gray.50'>
        <HStack spacing={0}>
          <Icon mr='-7px' mb='5px' w={8} h={8} as={HiOutlineClipboardCopy} />
          <Heading fontSize='2xl'>mokkit</Heading>
        </HStack>
      </Box>
    </Link>
  )
}
