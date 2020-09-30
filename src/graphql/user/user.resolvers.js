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

export default {
  Query: {
    users: async (root, args, context) => User.find({}, '_id email description avatarColor role username displayNameByProvider provider isSignedUp isAccountValidatedByEmail'),
    user: async (root, args, context) => User.findOne({ _id: args._id }, '_id avatarColor email username description avatar'),
    me: async (root, args, context) => context.req.currentUser,
  },
  User: {
    // fullname: (user) => `$(user.firstname) $(user.lastname)`,
  },
  Mutation: {
    authFacebook: async (root, { input: { accessToken } }, { req, res }) => {
      req.body = await Object.assign({}, req.body, { access_token: accessToken })
      console.log('Start authentication with Facebook')
      // data contains the accessToken, refreshToken and profile from passport
      return authenticateFacebookPromise(req, res)
        .then(({ data, info }) => data ? User.upsertFacebookUser(data) : throwErrorWithInfoFromPassport(info))
        .then(user => user ? ({ user: user, token: user.generateJWT() }) : new Error('ERROR Server error with user'))
        .catch(err => { throw err })
    },
    authLdap: async (root, { input: { username, password } }, { req, res }) => {
      req.body = await Object.assign({}, req.body, { username: username, password: password })
      console.log('Start authentication with Ldap')
      // data contains the accessToken, refreshToken and profile from passport
      return authenticateLdapPromise(req, res)
        // .then(({ data, info }) => data ? console.log(data) : throwErrorWithInfoFromPassport(info))
        .then(({ data, info }) => data ? User.upsertLdapUser(data) : throwErrorWithInfoFromPassport(info))
        .then(user => user ? ({ user: user, token: user.generateJWT() }) : new Error('ERROR Server error with user'))
        .catch(err => { throw err })
    },
    authGoogle: async (root, { input: { accessToken } }, { req, res }) => {
      req.body = await Object.assign({}, req.body, { access_token: accessToken })
      console.log('Start authentication with Google')
      // data contains the accessToken, refreshToken and profile from passport
      return authenticateGooglePromise(req, res)
        .then(({ data, info }) => data ? User.upsertGoogleUser(data) : throwErrorWithInfoFromPassport(info))
        .then(user => user ? ({ user: user, token: user.generateJWT() }) : new Error('ERROR Server error with user'))
        .catch(err => { throw err })
    },
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
        throw err
      }
    },
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
        throw err
      }
    },
    logout: async (root, args, context) => {
      try {
        const expiryDate = await Date.now() + 2000
        await context.res.cookie('refreshToken', '', {
          httpOnly: true,
          signed: true,
          secure: HTTPS_SET,
          expires: new Date(expiryDate),
          overwrite: true,
        })
        return { confirmed: true }
      } catch (e) {
        console.log(e)
        return { confirmed: false }
      }
    },
    refreshToken: async (root, args, context) => {
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
        console.log('STARTING Refresh...')
        const encryptedToken = context.req.signedCookies.refreshToken
        console.log('EncryptedToken: ', encryptedToken)
        if (!encryptedToken) {
          throw new Error('ERROR while searching for signed cookie named refreshToken')
        }
        const refreshToken = await decrypt(encryptedToken)
        if (!refreshToken) {
          await clearRefreshToken()
          throw new Error('ERROR while decrypting encrypted refreshToken')
        }
        console.log('SUCCESS: decrypting refreshToken')
        const { clearToken } = await verifyRefreshToken(refreshToken)
        console.log('Verified token: ', clearToken)
        if (!clearToken) {
          await clearRefreshToken()
          throw new Error('ERROR while verifying and clearing refreshToken')
        }
        const user = await User.findById(clearToken.data._id)
        console.log("Find currentUser: ", user.username)
        if (user && refreshToken === user.refreshToken) {
          console.log(`SUCCESS authentication with refreshToken`)
        } else {
          await clearRefreshToken(context)
          throw new Error(`ERROR while searching user and checking same refreshtoken in DB: ${clearToken.data._id} compared to ${user.refreshToken}`)
        }
        const { jwt, jwtExpiration, refreshToken: newRefreshToken, refreshTokenExpiration } = await user.generateTokens({scopes: ['User:Read', 'User:Write']})
        user.refreshToken = newRefreshToken
        await user.save()
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
        console.log(err.message)
        throw new RefreshTokenInvalidError()
      }
    },
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
    deleteUserWithPassword: async (root, args, context) => {
      try {
        return User.deleteWithPassword(args)
      } catch (err) {
        console.log(err)
        throw new DeleteError('ERROR while deleting')
      }
    },
    deleteUser: async function (root, args, context) {
      const user = await User.findByIdAndRemove(args)
      if (!user) {
        throw new DeleteError('ERROR while deleting')
      }
      return user
    },
    sendForgotPasswordEmail: async function (root, { email }, context) {
      console.log('Checking if email exists in database: ', email)
      const users = await User.find({ email })
      const user = users[0] || ''
      console.log("User found: ", user.username, " with email: ", user.email)
      if (!user) {
        return { confirmed: true, message: 'We sent you an email with a link if this email was good.' }
      }
      try {
        await user.forgotPasswordLockAccount()
        const key = v4()
        console.log("key V4 generated for the link: ", key)
        const expiration = Date.now() + 60*60*24*1000
        let passlink = await Passlink.findOneAndUpdate({ user: user }, { user, key, expiration }, { new: true, upsert: true })
        const passlinkUrl = `${CLIENT_ORIGIN}/newpassword/${key}`
        console.log("PasslinkUrl generated: ", passlinkUrl)
        sendForgottenPasswordEmail({ passlinkUrl, email: email, receiver: user })
        return { confirmed: true, message: 'We sent you an email with a link, you should receive it soon.' }
      } catch (err) {
        console.log(err)
        throw new SendNewPasswordLinkError('We could not send you the email, try later or contact support.')
      }
    },
    changePassword: async function(root, { password, key }, context) {
      console.log("password given: ", password, " and key given: ", key)
      const passlink = await Passlink.findOne({ key: key }).populate('user')
      console.log("Passlink found: ", passlink)
      if (!passlink || passlink.expiration < Date.now()) {
        throw new ChangePasswordError('Wrong or expired link to change password')
      }
      try {
        const user = passlink.user
        if (user.changePassword(password)) {
          const deletedpasslinks = await Passlink.deleteMany({ user: user })
          console.log("Delete this passlinks: ", deletedpasslinks)
          return { confirmed: true, message: "Your password was successfully updated" }
        }
        throw new Error ('Not able to change password')
      } catch (err) {
        console.log(err)
        throw new ChangePasswordError('Error while trying to save new password, try again or contact support')
      }
    }
  },
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue: (value) => moment(value).toDate(),
    serialize: (value) => value.getTime(),
    parseLiteral: (ast) => ast,
  }),
  JSON: GraphQLJSON,
}
