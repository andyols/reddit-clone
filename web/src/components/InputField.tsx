import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input
} from '@chakra-ui/react'
import { useField } from 'formik'
import React, { InputHTMLAttributes } from 'react'

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  name: string
  otherError?: string
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  size: _,
  otherError,
  ...props
}) => {
  const [field, { error }] = useField(props)
  const invalid = !!error || !!otherError

  return (
    <FormControl isInvalid={invalid}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      <Input
        {...field}
        {...props}
        id={field.name}
        placeholder={props.placeholder}
      />
      {invalid && <FormErrorMessage>{error || otherError}</FormErrorMessage>}
    </FormControl>
  )
}
