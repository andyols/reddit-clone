import { UserOptions } from '../resolvers/UserOptions'

export const validateRegister = (options: UserOptions) => {
  // validate email
  if (!options.email.includes('@')) {
    return [
      {
        field: 'email',
        message: 'invalid email'
      }
    ]
  }

  // validate username
  if (options.username.length <= 2) {
    return [
      {
        field: 'username',
        message: 'length must be greater than 2'
      }
    ]
  }

  // validate username
  if (options.username.includes('@')) {
    return [
      {
        field: 'username',
        message: 'cannot include an @'
      }
    ]
  }

  // validate password
  if (options.password.length <= 2) {
    return [
      {
        field: 'password',
        message: 'length must be greater than 2'
      }
    ]
  }

  return null
}
