import { GraphQLScalarType } from 'graphql'
import GraphQLJSON from 'graphql-type-json'
import moment from 'moment'
import User from '../../models/user.model'
import { HTTPS_SET } from '../../config'
import { RefreshTokenInvalidError, WrongCredentialsError, EmailError, DeleteError, EditError } from './user.errors'
import getRandomAvatarColor from '../utils/getRandomAvatarColor'
import { authenticateFacebookPromise } from '../../setup/auth/strategies/facebookTokenStrategy'
import { authenticateGooglePromise } from '../../setup/auth/strategies/googleTokenStrategy'
import { authenticateLdapPromise } from '../../setup/auth/strategies/ldapStrategy'
// import { authenticated } from '../utils/authenticated'
import _get from 'lodash/get'
import { encrypt, decrypt } from '../../utils/encryption'
import { verifyRefreshToken } from '../../utils/verifyToken'

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
