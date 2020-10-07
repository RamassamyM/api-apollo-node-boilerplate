/**
 * Implement the resolver for all queries or mutations with users in graphql
 * @module UserGraphqlResolvers
 * @requires graphql
 * @requires graphql-type-json
 * @requires moment
 * @requires lodash
 */
import { GraphQLScalarType } from 'graphql'
import GraphQLJSON from 'graphql-type-json'
import moment from 'moment'
import User from '../../models/user.model'
import { v4 } from 'uuid'
import Passlink from '../../models/passlink.model'
import { HTTPS_SET, CLIENT_ORIGIN } from '../../config'
import { RefreshTokenInvalidError, WrongCredentialsError, EmailError, DeleteError, EditError, SendNewPasswordLinkError, ChangePasswordError } from './user.errors'
import getRandomAvatarColor from '../utils/getRandomAvatarColor'
import { authenticateFacebookPromise } from '../../setup/auth/strategies/facebookTokenStrategy'
import { authenticateGooglePromise } from '../../setup/auth/strategies/googleTokenStrategy'
import { authenticateLdapPromise } from '../../setup/auth/strategies/ldapStrategy'
// import { authenticated } from '../utils/authenticated'
import _get from 'lodash/get'
import { encrypt, decrypt } from '../../utils/encryption'
import { verifyRefreshToken } from '../../utils/generateAndVerifyToken'
import { sendForgottenPasswordEmail } from '../../utils/emailServices/sendNodemailerMail'

// The userLocationOnContext is defined in the creation of GraphqlServer in graphqlserver.js
const userLocationInContext = 'req.currentUser'

/**
 * Throws an error according to the info returned by passportJS plugin
 * @param { Object } info
 * @param { String } info.code 
 * @param { String } info.message
 * @throws different types of error
 * @private
 */
const throwErrorWithInfoFromPassport = (info) => {
  if (info && info.code) {
    switch (info.code) {
      case 'ETIMEDOUT':
        throw new Error('ERROR Failed to reach Authentication API: Try Again')
      default:
        throw new Error('ERROR Something went wrong with Authentication API')
    }
  } else {
    throw new Error(info.message || 'ERROR Data Error with Authentication API')
  }
}

/**
 * @const default
 * @property { Object } Query Handle the user graphql queries
 * @property { Object } User Handle the user graphql computed property
 * @property { Object } Mutation Handle the user graphql mutations
 * @property { Object } Date Handle the graphql type DATE
 * @property { Object } JSON Handle the graphql type JSON
 */
export default {
  Query: {
    /**
     * @function users
     * @desc Query that returns user instances informations
     * @async
     */
    users: async (root, args, context) => User.find({}, '_id email description avatarColor role username displayNameByProvider provider isSignedUp isAccountValidatedByEmail'),
    /**
     * @function user
     * @desc Query that finds a user with his id and returns the user informations
     * @async
     */
    user: async (root, args, context) => User.findOne({ _id: args._id }, '_id avatarColor email username description avatar'),
    /**
     * @function me
     * @desc Query that returns current user informations
     * @async
     */
    me: async (root, args, context) => context.req.currentUser,
  },
  User: {
    // fullname: (user) => `$(user.firstname) $(user.lastname)`,
  },
  Mutation: {
    /**
     * @function authFacebook
     * @desc Mutation that handles the authentication mutation using facebook authentication
     * @return { Object } An object containing { user, token }
     * @throws error
     * @async
     */
    authFacebook: async (root, { input: { accessToken } }, { req, res }) => {
      req.body = await Object.assign({}, req.body, { access_token: accessToken })
      console.log('Start authentication with Facebook')
      // authenticateFacebookPromise is a PassportJS strategy implementation
      // data contains the accessToken, refreshToken and profile from passport
      return authenticateFacebookPromise(req, res)
        .then(({ data, info }) => data ? User.upsertFacebookUser(data) : throwErrorWithInfoFromPassport(info))
        .then(user => user ? ({ user: user, token: user.generateJWT() }) : new Error('ERROR Server error with user'))
        .catch(err => { 
          console.log(err)
          throw new Error('Error while trying to authenticate, try again or contact support') 
        })
    },
    /**
     * @function authLdap
     * @desc Mutation that handles the authentication mutation using ldap authentication
     * @return { Object } An object containing { user, token }
     * @throws Error
     * @async
     */
    authLdap: async (root, { input: { username, password } }, { req, res }) => {
      req.body = await Object.assign({}, req.body, { username: username, password: password })
      console.log('Start authentication with Ldap')
      // data contains the accessToken, refreshToken and profile from passport
      return authenticateLdapPromise(req, res)
        // to debug uncomment line below
        // .then(({ data, info }) => data ? console.log(data) : throwErrorWithInfoFromPassport(info))
        .then(({ data, info }) => data ? User.upsertLdapUser(data) : throwErrorWithInfoFromPassport(info))
        .then(user => user ? ({ user: user, token: user.generateJWT() }) : new Error('ERROR Server error with user'))
        .catch(err => { 
          console.log(err)
          throw new Error('Error while trying to authenticate, try again or contact support') 
        })
    },
    /**
     * @function authGoogle
     * @desc Mutation that handles the authentication mutation using Google authentication
     * @return { Object } An object containing { user, token }
     * @throws Error
     * @async
     */
    authGoogle: async (root, { input: { accessToken } }, { req, res }) => {
      req.body = await Object.assign({}, req.body, { access_token: accessToken })
      console.log('Start authentication with Google')
      // data contains the accessToken, refreshToken and profile from passport
      return authenticateGooglePromise(req, res)
        .then(({ data, info }) => data ? User.upsertGoogleUser(data) : throwErrorWithInfoFromPassport(info))
        .then(user => user ? ({ user: user, token: user.generateJWT() }) : new Error('ERROR Server error with user'))
        .catch(err => { 
          console.log(err)
          throw new Error('Error while trying to authenticate, try again or contact support') 
        })
    },
    /**
     * @function signup
     * @desc Mutation that creates a user instance in database and returns it with authentication tokens
     * @return { Object } An object with { jwt, jwtExpiration, user }
     * @throws SignupError
     * @async
     */
    signup: async (root, { email, username, genres, password }, context) => {
      try {
        const user = _get(context, userLocationInContext)
        if (!user) {
          const avatarColor = await getRandomAvatarColor()
          const { jwt, jwtExpiration, refreshToken, refreshTokenExpiration, user } = await User.signup({email, username, password, avatarColor})
          const encryptedRefreshtoken = await encrypt(refreshToken)
          await context.res.cookie('refreshToken', encryptedRefreshtoken, {
            httpOnly: true,
            signed: true,
            secure: HTTPS_SET,
            expires: new Date(refreshTokenExpiration*1000)
          })
          console.log(`SUCCESS login : ${user.username}`)
          return { jwt, jwtExpiration, user }
        } else {
          throw new Error('ERROR User already authenticated')
        }
      } catch (err) {
        console.log(err)
        throw new Error('Error while trying to signup, try again or contact support')
      }
    },
    /**
     * @function login
     * @desc Mutation that handles the authentication with email and password
     * @throws LoginError
     * @async
     */
    login: async (root, { email, password }, context) => {
      try {
        const currentUser = _get(context, userLocationInContext)
        if (currentUser) {
          throw new Error('ERROR User already logged in')
        } else {
          const { jwt, jwtExpiration, refreshToken, refreshTokenExpiration, user } = await User.authenticate({email, password})
          if (!user) {
            throw new WrongCredentialsError()
          }
          if (!jwt || !refreshToken) {
            throw new Error('ERROR Authentication token, try again or contact support')
          }
          const encryptedRefreshtoken = await encrypt(refreshToken)
          await context.res.cookie('refreshToken', encryptedRefreshtoken, {
            httpOnly: true,
            signed: true,
            secure: HTTPS_SET,
            expires: new Date(refreshTokenExpiration*1000)
          })
          console.log(`SUCCESS login : ${user.username}`)
          return { jwt, jwtExpiration, user }
        }
      } catch (err) {
        console.log(err)
        throw new Error('Error while trying to login, try again or contact support')
      }
    },
    /**
     * @function logout
     * @desc Mutation that will force logout of user by updating refreshToken expiry
     * @async
     */
    logout: async (root, args, context) => {
      try {
        // Clears the current refreshToken by updating expiry date (very short one) in the refreshToken response
        const expiryDate = await Date.now() + 2000
        await context.res.cookie('refreshToken', '', {
          httpOnly: true,
          signed: true,
          secure: HTTPS_SET,
          expires: new Date(expiryDate),
          overwrite: true,
        })
        return { confirmed: true }
      } catch (err) {
        console.log(err)
        return { confirmed: false }
      }
    },
    /**
     * @function refreshToken
     * @desc Mutation that generates new jwtToken and refreshToken 
     * if refreshToken in the request is valid and correct for the user
     * then returns jwt, jwt expiration, some user data and add refreshToken in response
     * @return { Object } An object containing { jwt, jwtExpiration, user }
     * @throws RefreshTokenInvalidError
     * @async
     */
    refreshToken: async (root, args, context) => {
      /**
       * Clears the current refreshToken by updating expiry date (very short one) in the refreshToken response
       * @param { Object } context
       * @async
       * @private
       * @todo refactor a global function in module to use also with logout mutation
       */
      const clearRefreshToken = async (context) => {
        const expiryDate = await Date.now() + 2000
        await context.res.cookie('refreshToken', '', {
          httpOnly: true,
          signed: true,
          secure: HTTPS_SET,
          expires: new Date(expiryDate),
          // expires: false,
          overwrite: true,
        })
        return
      }
      try {
        console.log('STARTING Refresh token...')
        const encryptedToken = context.req.signedCookies.refreshToken
        // console.log('EncryptedToken: ', encryptedToken)
        if (!encryptedToken) {
          throw new Error('ERROR while searching for signed cookie named refreshToken')
        }
        // the refreshToken is encrypted for security and it has to be decrypted
        const refreshToken = await decrypt(encryptedToken)
        if (!refreshToken) {
          // In case of a problem with the token, the current refreshToken is cleared
          await clearRefreshToken()
          throw new Error('ERROR while decrypting encrypted refreshToken')
        }
        console.log('SUCCESS: decrypting refreshToken')
        // The informations of the token have to be revealed in a cleartoken
        const { clearToken } = await verifyRefreshToken(refreshToken)
        console.log('Verified token: ', clearToken)
        if (!clearToken) {
          await clearRefreshToken()
          throw new Error('ERROR while verifying and clearing refreshToken')
        }
        const user = await User.findById(clearToken.data._id)
        console.log("Find currentUser: ", user.username)
        // Checks if the refreshToken is correct in the database
        if (user && refreshToken === user.refreshToken) {
          console.log(`SUCCESS authentication with refreshToken`)
        } else {
          await clearRefreshToken(context)
          throw new Error(`ERROR while searching user and checking same refreshtoken in DB: ${clearToken.data._id} compared to ${user.refreshToken}`)
        }
        // Generates new tokens
        const { jwt, jwtExpiration, refreshToken: newRefreshToken, refreshTokenExpiration } = await user.generateTokens({scopes: ['User:Read', 'User:Write']})
        // Update refreshToken for the user in database
        user.refreshToken = newRefreshToken
        await user.save()
        // Encrypt the refreshToken before adding it in the request
        const encryptedRefreshtoken = await encrypt(user.refreshToken)
        await context.res.cookie('refreshToken', encryptedRefreshtoken, {
          httpOnly: true,
          signed: true,
          secure: HTTPS_SET,
          expires: new Date(refreshTokenExpiration*1000)
        })
        console.log('SUCCESS verify old refreshToken and set new refreshToken')
        return { jwt, jwtExpiration, user }
      } catch (err) {
        console.log(err)
        throw new RefreshTokenInvalidError()
      }
    },
    /**
     * @function editUser
     * @desc Mutation that updates user infos
     * @return { Object } the user infos
     * @throws EditError
     * @async
     */
    editUser: async (root, args, context) => {
      try {
        const options = { new: true, runValidators: true }
        const query = { _id: args._id }
        await delete args.__id
        return User.findOneAndUpdate(query, args, options)
      } catch (err) {
        console.log(err)
        throw new EditError('ERROR while trying to edit')
      }
    },
    /**
     * @function deleteUserWithPassword
     * @desc Mutation that delete a user by verifying the password
     * @return { Object } the deleted user infos in case of an error
     * @throws DeleteError
     * @async
     */
    deleteUserWithPassword: async (root, args, context) => {
      try {
        return User.deleteWithPassword(args)
      } catch (err) {
        console.log(err)
        throw new DeleteError('ERROR while deleting')
      }
    },
    /**
     * @function deleteUser
     * @desc Mutation that delete a user with his id
     * @return { Object } the deleted user infos in case of an error
     * @throws DeleteError
     * @async
     */
    deleteUser: async function (root, args, context) {
      const user = await User.findByIdAndRemove(args)
      if (!user) {
        throw new DeleteError('ERROR while deleting')
      }
      return user
    },
    /**
     * @function sendForgotPasswordEmail
     * @desc Mutation that send an email with a link to change password in case the user forgot his password
     * @return { Object } An object with a boolean confirmed and a message
     * @throws SendNewPasswordLinkError
     * @async
     */
    sendForgotPasswordEmail: async function (root, { email }, context) {
      console.log('Checking if email exists in database: ', email)
      const users = await User.find({ email })
      const user = users[0] || ''
      console.log("User found: ", user.username, " with email: ", user.email)
      if (!user) {
        // For security, to avoid that a hacker knows that the email exists in the database, a fake message is sent
        return { confirmed: true, message: 'If the email provided is correct, you will receive an email shortly with a link.' }
      }
      try {
        // The user account is locked waiting for a password change
        await user.forgotPasswordLockAccount()
        // Generates a random uuid number for a secure url
        const key = v4()
        console.log("key V4 generated for the link: ", key)
        // the password reset url link has an expiry of 1 day
        const expiration = Date.now() + 60*60*24*1000
        // if a previous passlink exists, it will be updated in order to keep only one valid passlink
        let passlink = await Passlink.findOneAndUpdate({ user: user }, { user, key, expiration }, { new: true, upsert: true })
        const passlinkUrl = `${CLIENT_ORIGIN}/newpassword/${key}`
        console.log("PasslinkUrl generated: ", passlinkUrl)
        // Uses a service to send the email but returns before the sending was done
        sendForgottenPasswordEmail({ passlinkUrl, email: email, receiver: user })
        return { confirmed: true, message: 'If the email provided is correct, you will receive an email shortly with a link.' }
      } catch (err) {
        console.log(err)
        throw new SendNewPasswordLinkError('We could not send you the email, try later or contact support.')
      }
    },
    /**
     * @function changePassword
     * @desc Mutation that will change an authentication password for a user
     * @return { Object } An object with a boolean confirmed and a message
     * @throws ChangePasswordError
     * @async
     */
    changePassword: async function(root, { password, key }, context) {
      console.log("password given: ", password, " and key given: ", key)
      // check in database a passlink with the key provided
      const passlink = await Passlink.findOne({ key: key }).populate('user')
      console.log("Passlink found: ", passlink)
      // Check existence of passlink and expiry validity
      if (!passlink || passlink.expiration < Date.now()) {
        throw new ChangePasswordError('Wrong or expired link to change password')
      }
      try {
        const user = passlink.user
        if (user.changePassword(password)) {
          // After changing the user password, all links for password are deleted in database
          const deletedpasslinks = await Passlink.deleteMany({ user: user })
          console.log("Deleted these passlinks: ", deletedpasslinks)
          return { confirmed: true, message: "Your password was successfully updated" }
        }
        throw new Error ('Not able to change password')
      } catch (err) {
        console.log(err)
        throw new ChangePasswordError('Error while trying to save new password, try again or contact support')
      }
    }
  },
  // Implement the Date graphql type
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue: (value) => moment(value).toDate(),
    serialize: (value) => value.getTime(),
    parseLiteral: (ast) => ast,
  }),
  // Implement the JSON graphql type
  JSON: GraphQLJSON,
}
