import React from 'react'
import { Navbar } from './Navbar'
import { Wrapper, WrapperVariant } from './Wrapper'

interface LayoutProps {
  variant?: WrapperVariant
}

export const Layout: React.FC<LayoutProps> = ({ variant, children }) => {
  return (
    <>
      <Navbar />
      <Wrapper {...{ variant }}>{children}</Wrapper>
    </>
  )
}
