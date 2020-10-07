/**
 * Handle Mongoose tasks related to the User collection
 *
 * @module UserModel
 * @requires mongoose
 */
import mongoose from 'mongoose'
import { generateJWTToken, generateRefreshToken } from '../utils/generateAndVerifyToken'
import { hashPassword, comparePassword } from './utils/passwordLib'
import debug from 'debug'

const ObjectId = mongoose.Schema.Types.ObjectId

/**
 * Enum for level values
 * @enum
 * @desc The list of levels available for a user as an array
 * @readonly
 */
export const levelEnum = ['Beginner', 'Rookie', 'All Star', 'All of fame']


/**
 * @typedef { Object } UserParameters
 * @property { String } username unique
 * @property { String } [avatarColor]
 * @property { String } [avatar]
 * @property { String } description
 * @property { String } [role]
 * @property { Boolean } [roleAdmin]
 * @property { String } email unique
 * @property { String } [password]
 * @property { Boolean } [passwordLocked]
 * @property { Boolean } [isAccountValidatedByEmail]
 * @property { String } [provider]
 * @property { String } [providerId]
 * @property { String } [providerToken]
 * @property { String } [refreshToken]
 * @property { String } [displayNameByProvider]
 * @property { Date } [lastlogged] read only
 */
/**
 * @constructor
 * @desc Create a model schema for user with mongoose
 * @memberof UserModel
 * @private
 */
const userSchema = new mongoose.Schema(
  {
  username: { type: String, index: { unique: true } },
  avatarColor: { type: String, default: '#2196F3' },
  avatar: {
    type: String,
    default:'http://envato.rathemes.com/infinity/assets/images/221.jpg'
  },
  description: {
    type: String
  },
  role: {
    type: String,
    default: 'user',
  },
  roleAdmin: {
    type: Boolean,
    default: false,
  },
  email: {
    type: String,
    index: { unique: true },
    lowercase: true,
    trim: true,
    required: true,
  },
  password: { type: String, default: undefined },
  passwordLocked: { type: Boolean, default: false },
  isAccountValidatedByEmail: {
    type: Boolean,
    default: false,
  },
  provider: String,
  providerId: String,
  providerToken: String,
  refreshToken: String,
  displayNameByProvider: String,
  lastlogged: Date,
}, { timestamps: true })

/**
 * @function checkExistence 
 * @desc Check existence of a user in database according to the username or the email
 * @param { Object } parameters
 * @param { String } parameters.username
 * @param { String } parameters.email
 * @return { Boolean } the existence or not of the user checked in the database
 * @memberof module:UserModel~User
 * @static
 */
userSchema.statics.checkExistence = async ({username, email}) => {
  let exist
  await User.find().or([{ username: username }, { email: email }])
    .then(users => {
      if (users.length > 0) {
        exist = true
      } else {
        exist = false
      }
    })
    .catch(err => {
      console.log(err)
      throw err
    })
  return exist
}

/**
 * @function generateTokens
 * @desc generates tokens (jwt and refresk tokens with expirations) for the current user instance with scopes provided
 * @param { Object } parameters
 * @param { Object } parameters.scopes
 * @return { Object } An object with jwt, jwtExpiration, refreshToken, refreshTokenExpiration
 * @memberof module:UserModel~User
 * @instance
 */
userSchema.methods.generateTokens = async function ({scopes}) {
  const id = this._id
  const tokenPayload = { _id: id, scopes }
  const { refreshToken, refreshTokenExpiration } = await generateRefreshToken(tokenPayload)
  this.refreshToken = refreshToken
  await this.save()
  const { jwt, jwtExpiration } = await generateJWTToken(tokenPayload)
  return { jwt, jwtExpiration, refreshToken, refreshTokenExpiration }
}

/**
 * @function signup
 * @desc Signup a user
 * @param { Object } parameters
 * @param { String } parameters.username
 * @param { String } parameters.email
 * @param { String } parameters.password
 * @param { String } parameters.avatarColor as hexadecimal String
 * @return { Object } An object with jwt, jwtExpiration, refreshToken, refreshTokenExpiration and 
 * the created user instance as an object
 * @throws an error
 * @memberof module:UserModel~User
 * @static
 */
userSchema.statics.signup = async ({username, email, password, avatarColor}) => {
  try {
    const hashedPassword = await hashPassword(password.toString())
    const userExist = await User.checkExistence({username, email})
    if (userExist) {
      console.log('Could not create user because user already exists')
    }
    if (!!hashedPassword && !userExist) {
      const user = new User({ 'password': hashedPassword, avatarColor, email, username })
      const { jwt, jwtExpiration, refreshToken, refreshTokenExpiration } = await user.generateTokens({scopes: ['User:Read', 'User:Write']})
      user.refreshToken = refreshToken
      await user.save()
      return { jwt, jwtExpiration, refreshToken, refreshTokenExpiration, user }
    }
    throw new Error('ERROR while trying to Signup with password, email or username. Try again.')
  } catch (err) {
    throw err
  }
}

/**
 * @todo implement function getGoogleAvatar
 * @function getGoogleAvatar
 * @param { Object } profile
 */
// function getGoogleAvatar (profile) {
//   if (profile.photos && profile.photos.length) {
//     return profile.photos[0].value
//   }
// }

/**
 * @function getEmail
 * @desc Returns the first email of the emails of a user if ther is one or return null
 * @param { Object } profile of a user
 * @return { (String|null) } an email or null
 * @private
 */
function getEmail (profile) {
  if (profile.emails && profile.emails.length) {
    return profile.emails[0].value
  }
  return null
}

/**
 * @function upsertGoogleUser
 * @desc Create a user in database according to linked Google user or update an existing user
 * @param { Object } data
 * @param { String } data.accessToken
 * @param { String } data.refreshToken
 * @param { Object } data.profile an Object with all given infos from the authentication provider
 * @param { String } data.profile.id as the id of the user in the database provider
 * @param { String } data.profile.provider as the identification name of the provider, for example google
 * @param { String } [data.profile.displayName] as the displayed name of the user in the provider database
 * @param { Object } [data.profile.name] which can include familyName, givenName
 * @param { Object } [data.profile._json] which can include first_name, last_name
 * @param { Object } [data.profile.email]
 * @param { String[] } [data.profile.emails]
 * @return { Object } the updated or created user instance
 * @memberof module:UserModel~User
 * @static
 */
userSchema.statics.upsertGoogleUser = async function ({ accessToken, refreshToken, profile }) {
  const query = { providerId: profile.id, provider: profile.provider }
  const update = {
    displayNameByProvider: profile.displayName || `${profile.name.givenName} ${profile.name.familyName}` || `${profile._json.first_name} ${profile._json.last_name}`,
    username: profile.displayName || `${profile.name.givenName} ${profile.name.familyName}` || `${profile._json.first_name} ${profile._json.last_name}`,
    firstname: profile._json.first_name || '',
    lastname: profile._json.last_name || '',
    email: profile.email || getEmail(profile) || '',
    // avatar: getGoogleAvatar(profile),
    providerToken: accessToken,
    provider: profile.provider || 'google',
    providerId: profile.id,
    refreshToken: refreshToken,
    isSignedUp: true,
  }
  const options = { upsert: true, new: true, setDefaultsOnInsert: true }
  return User.findOneAndUpdate(query, update, options)
}

/**
 * @function upsertFacebookUser
 * @desc Create a user in database according to linked Google user or update an existing user
 * @param { Object } data
 * @param { String } data.accessToken
 * @param { String } data.refreshToken
 * @param { Object } data.profile an Object with all given infos from the authentication provider
 * @param { String } data.profile.id as the id of the user in the database provider
 * @param { String } data.profile.provider as the identification name of the provider, for example google
 * @param { String } [data.profile.displayName] as the displayed name of the user in the provider database
 * @param { Object } [data.profile.name] which can include familyName, givenName
 * @param { Object } [data.profile._json] which can include first_name, last_name
 * @param { Object } [data.profile.email]
 * @param { String[] } [data.profile.emails]
 * @return { Object } the updated or created user instance
 * @memberof module:UserModel~User
 * @static
 */
userSchema.statics.upsertFacebookUser = async function ({ accessToken, refreshToken, profile }) {
  const query = { providerId: profile.id, provider: profile.provider }
  const update = {
    displayNameByProvider: profile.displayName || `${profile.name.givenName} ${profile.name.familyName}` || `${profile._json.first_name} ${profile._json.last_name}`,
    username: profile.displayName || `${profile.name.givenName} ${profile.name.familyName}` || `${profile._json.first_name} ${profile._json.last_name}`,
    firstname: profile._json.first_name || '',
    lastname: profile._json.last_name || '',
    email: profile.email || getEmail(profile) || '',
    providerToken: accessToken,
    provider: profile.provider || 'facebook',
    providerId: profile.id,
    refreshToken: refreshToken,
    isSignedUp: true,
  }
  const options = { upsert: true, new: true, setDefaultsOnInsert: true }
  return User.findOneAndUpdate(query, update, options)
}

/**
 * @function upsertGoogleUser
 * @desc Create a user in database according to linked Google user or update an existing user
 * @param { Object } data
 * @param { Object } data.userLdap
 * @param { String } data.userLdap.uidNumber
 * @param { String } [data.userLdap.uid]
 * @param { String } [data.userLdap.displayName]
 * @param { String } [data.userLdap.givenName]
 * @param { String } [data.userLdap.familyName]
 * @param { String } [data.userLdap.mail]
 * @return { Object } the updated or created user instance
 * @memberof module:UserModel~User
 * @static
 */
userSchema.statics.upsertLdapUser = async function ({ userLdap }) {
  const query = { providerId: userLdap.uidNumber, provider: 'ldap' }
  const update = {
    displayNameByProvider: userLdap.displayName || userLdap.givenName,
    username: userLdap.uid || userLdap.displayName || userLdap.givenName,
    firstname: userLdap.givenName || '',
    lastname: userLdap.familyName || '',
    email: userLdap.mail || '',
    provider: 'ldap',
    providerId: userLdap.uidNumber,
    isSignedUp: true,
  }
  const options = { upsert: true, new: true, setDefaultsOnInsert: true }
  return User.findOneAndUpdate(query, update, options)
}

/**
 * @function authenticate
 * @desc Authenticate the user for logging in and create authentication tokens for the logged user
 * @param { Object } parameters
 * @param { String } parameters.email
 * @param { String } parameters.password
 * @return { Object } An object with jwt, jwtExpiration, refreshToken, refreshTokenExpiration, 
 * and user as the user instance object
 * @throws an error
 * @memberof module:UserModel~User
 * @static
 */
userSchema.statics.authenticate = async ({email, password}) => {
  try {
    // check if user exits
    const user = await User.findOne({ email })
    if (!user) {
      console.log('ERROR Login failed : email not in database')
      return { jwt: null, refreshToken: null, user: null }
    }
    // if user, verify the user password with the password provided
    const isValidPassword = await comparePassword(password, user.password)
    // You can choose to lock the login with previous password if a change password has been asked by email
    // if (user.passwordLocked) {
    //   console.log('Try to log but account locked')
    //   return { jwt: null, refreshToken: null, user: null }
    // }
    if (!isValidPassword) {
      console.log('ERROR Login failed : password error')
      return { jwt: null, refreshToken: null, user: null }
    }
    // assign the user a token
    const { jwt, jwtExpiration, refreshToken, refreshTokenExpiration } = await user.generateTokens({scopes: ['User:Read', 'User:Write']})
    user.refreshToken = refreshToken
    await user.save()
    return { jwt, jwtExpiration, refreshToken, refreshTokenExpiration, user }
  } catch (err) {
    console.log(err)
    throw new Error('ERROR while trying to log in. Try again.')
  }
}

/**
 * @function deleteWithPassword
 * @desc Delete a user by checking if the password provided is correct 
 * @param { Object } parameters
 * @param { String } parameters._id
 * @param { String } parameters.password
 * @return { Object } An object with a confirmed boolena and 
 * the deleted user instance object in case of error to be able to recreate the user
 * @throws an error
 * @memberof module:UserModel~User
 * @static
 */
userSchema.statics.deleteWithPassword = async ({ _id, password }) => {
  try {
    const userToDelete = await User.findOne({ _id })
    if (!userToDelete) {
      throw new Error('ERROR There was a problem with this user')
    }
    const isValidPassword = await comparePassword(password, userToDelete.local.password)
    if (!isValidPassword) {
      throw new Error('ERROR There was a problem while trying to delete the user')
    }
    const deletedUser = await User.deleteOne({ _id })
    if (!deletedUser) {
      throw new Error('ERROR while trying to delete the user')
    }
    return { user: deletedUser, confirmed: true }
  } catch (err) {
    throw err
  }
}

/**
 * @function forgotPasswordLockAccount
 * @desc Lock the user account when a forgot password link is asked to avoid to log in with the old password
 * @return { Object } An object which is the user instance
 * @memberof module:UserModel~User
 * @instance
 */
userSchema.methods.forgotPasswordLockAccount = async function() {
  try {
    this.passwordLocked = true
    return this.save
  } catch (err) {
    console.log(err)
  }
}

/**
 * @function changePassword
 * @desc Hash the password and save it in database, remove the passwordLocked
 * @return { Boolean } The confirmation that the new password has been correctly savec and hashed
 * @throws an error
 * @memberof module:UserModel~User
 * @instance
 */
userSchema.methods.changePassword = async function(password) {
  try {
    const hashedPassword = await hashPassword(password.toString())
    if (!!hashedPassword) {
      this.password = hashedPassword
      this.passwordLocked = false
      await this.save()
      return true
    }
    throw new Error('Error while trying to change password. Try again or contact support.')
  } catch (err) {
    console.log(err)
    throw err
  }
}

/** 
 * The class for the user model in mongoose
 * @constructor
 * @param { UserParameters } parameters
 */
const User = mongoose.model('User', userSchema)

export default User
