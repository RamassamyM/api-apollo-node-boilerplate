// import { setupFacebookTokenStrategy } from './strategies/facebookTokenStrategy'
// import { setupGoogleTokenStrategy } from './strategies/googleTokenStrategy'
import { setupJwtStrategy } from './strategies/jwtStrategy'
// import { setupLdapTokenStrategy } from './strategies/ldapStrategy'

/**
 * @function setupPassport 
 */
export default function () {
  // Launch the different setups for different passport package authentication by uncommenting below
  // setupFacebookTokenStrategy()
  // setupLdapTokenStrategy()
  // setupGoogleTokenStrategy()
  setupJwtStrategy()
}
