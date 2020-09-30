import passport from 'passport'
import { Strategy as GoogleTokenStrategy } from 'passport-google-token'
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '../../../config'

/**
 * Configure passport to use a google token authentication strategy
 * @throws error (exemples : clientId or clientSecret missing or invalid, error with passport.use)
 */
export function setupGoogleTokenStrategy () {
  const googleOptions = {
    callbackURL: '/auth/google/callback',
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
  }
  const GoogleTokenStrategyCallback = (accessToken, refreshToken, profile, done) => done(null, {
    accessToken,
    refreshToken,
    profile,
  })

  passport.use('google', new GoogleTokenStrategy(googleOptions, GoogleTokenStrategyCallback))
}

/* eslint-disable no-new */
/**
 * Return data and info of authentication with passport and google
 * @param { Object } req 
 * @param { Object } res
 * @return { Promise } Promise object represents an error thrown or an object with data object and info object generated by passport
 */
export function authenticateGooglePromise (req, res) {
  new Promise((resolve, reject) => {
    passport.authenticate('google', { session: false }, (err, data, info) => {
      err ? reject(err) : resolve({ data, info })
    })(req, res)
  })
}
