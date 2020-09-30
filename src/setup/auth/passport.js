// import { setupFacebookTokenStrategy } from './strategies/facebookTokenStrategy'
// import { setupGoogleTokenStrategy } from './strategies/googleTokenStrategy'
import { setupJwtStrategy } from './strategies/jwtStrategy'
// import { setupLdapTokenStrategy } from './strategies/ldapStrategy'

/**
 * @function setupPassport launch the different setups for different passport package authentication
 */
export default function () {
  // Configure here the authentication strategies allowed by uncommenting below
  // setupFacebookTokenStrategy()
  // setupLdapTokenStrategy()
  // setupGoogleTokenStrategy()
  setupJwtStrategy()
}
