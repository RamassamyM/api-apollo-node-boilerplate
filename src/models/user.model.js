import mongoose from 'mongoose'
import { generateJWTToken, generateRefreshToken } from '../utils/generateAndVerifyToken'
import { hashPassword, comparePassword } from './utils/passwordLib'
import debug from 'debug'

const ObjectId = mongoose.Schema.Types.ObjectId
const levelEnum = ['Beginner', 'Rookie', 'All Star', 'All of fame']

const userSchema = new mongoose.Schema({
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

// userSchema.methods.validPassword = function (password) {
//   return comparePassword(password, this.local.password)
// }

// userSchema.methods.addOnePlayedGame = function () {
//   this.playedGamesNb = this.playedGamesNb + 1
//   return this.save()
// }

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

userSchema.methods.generateTokens = async function ({scopes}) {
  const id = this._id
  const tokenPayload = { _id: id, scopes }
  const { refreshToken, refreshTokenExpiration } = await generateRefreshToken(tokenPayload)
  this.refreshToken = refreshToken
  await this.save()
  const { jwt, jwtExpiration } = await generateJWTToken(tokenPayload)
  return { jwt, jwtExpiration, refreshToken, refreshTokenExpiration }
}

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

// function getGoogleAvatar (profile) {
//   if (profile.photos && profile.photos.length) {
//     return profile.photos[0].value
//   }
// }

function getEmail (profile) {
  if (profile.emails && profile.emails.length) {
    return profile.emails[0].value
  }
}

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
    provider: profile.provider || 'facebook',
    providerId: profile.id,
    refreshToken: refreshToken,
    isSignedUp: true,
  }
  const options = { upsert: true, new: true, setDefaultsOnInsert: true }
  return User.findOneAndUpdate(query, update, options)
}

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

userSchema.methods.forgotPasswordLockAccount = async function() {
  try {
    this.passwordLocked = true
    return this.save
  } catch (err) {
    console.log(err)
  }
}

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

const User = mongoose.model('User', userSchema)

export default User
