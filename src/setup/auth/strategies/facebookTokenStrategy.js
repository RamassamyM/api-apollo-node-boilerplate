import passport from 'passport'
import FacebookStrategy from 'passport-facebook-token'
// import FacebookStrategy from 'passport-facebook' // not working
import { FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET } from '../../../config'

/**
 * Configure passport to use a facebook token authentication strategy
 * @throws error (exemples : clientId or clientSecret missing or invalid, error with passport.use)
 */
export function setupFacebookTokenStrategy () {
  try {
    const facebookOptions = {
      callbackURL: '/auth/facebook/callback',
      clientID: FACEBOOK_CLIENT_ID,
      clientSecret: FACEBOOK_CLIENT_SECRET,
      profileFields: ['id', 'name', 'emails'],
    }
    const facebookTokenStrategyCallback = (accessToken, refreshToken, profile, done) => {
      done(null, {
        accessToken,
        refreshToken,
        profile,
      })
    }
    passport.use('facebook', new FacebookStrategy(facebookOptions, facebookTokenStrategyCallback))
  } catch (error) {
    throw error
  }
}

/**
 * Return data and info of authentication with passport and facebook
 * @param { Object } req 
 * @param { Object } res
 * @return { Promise } Promise object represents an error thrown or an object with data object and info object generated by passport
 */
export function authenticateFacebookPromise (req, res) {
  return new Promise((resolve, reject) => {
    passport.authenticate('facebook', { session: false }, (err, data, info) => {
      err ? reject(err) : resolve({ data, info })
    })(req, res)
  })
}
