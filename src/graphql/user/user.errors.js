import { ApolloError } from 'apollo-server-errors'

/**
 * @class
 * @classdesc Create an error with a message for wrong credentials that have been given
 */
export class WrongCredentialsError extends ApolloError {
  constructor () {
    super('WrongCredentialsError', 'CREDENTIALS_ERROR', {
      message: 'The provided credentials are missing or invalid.',
    })
  }
}

/**
 * @class
 * @classdesc Create an error with a message for invalid refresh token that has been given
 */
export class RefreshTokenInvalidError extends ApolloError {
  constructor () {
    super('RefreshTokenInvalidError', 'REFRESHTOKEN_INVALID', {
      message: 'The refreshToken is missing or invalid.',
    })
  }
}

/**
 * @class
 * @classdesc Create an error with a message when an error occurrend while sending an email
 */
export class EmailError extends ApolloError {
  constructor () {
    super('EmailError', 'EMAIL_ERROR', {
      message: 'There was a problem with your email.',
    })
  }
}

/**
 * @class
 * @classdesc Create an error with a message when trying to delete a document
 */
export class DeleteError extends ApolloError {
  constructor (message) {
    super('DeleteError', 'DELETE_ERROR', {
      message: message,
    })
  }
}

/**
 * @class
 * @classdesc Create an error with a message when trying to edit an entry
 */
export class EditError extends ApolloError {
  constructor (message) {
    super('EditError', 'EDIT_ERROR', {
      message: message,
    })
  }
}

/**
 * @class
 * @classdesc Create an error with a message when trying to send a link to change the password
 */
export class SendNewPasswordLinkError extends ApolloError {
  constructor (message) {
    super('SendNewPasswordLinkError', 'SEND_NEW_PASSWORD_LINK_ERROR', {
      message: message,
    })
  }
}

/**
 * @class
 * @classdesc Create an error with a message when trying to change a password
 */
export class ChangePasswordError extends ApolloError {
  constructor (message) {
    super('ChangePasswordError', 'CHANGE_PASSWORD_ERROR', {
      message: message,
    })
  }
}
