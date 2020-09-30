import jwt from 'jsonwebtoken'
import { JWT_PUBLICKEY, REFRESHTOKEN_PUBLICKEY, JWT_PRIVATEKEY, REFRESHTOKEN_PRIVATEKEY, JWT_TOKEN_DURATION, REFRESHTOKEN_DURATION } from '../config'
import _ from 'lodash'

/**
 * Generates a token according to private key and expirationDuration and including given data 
 * then returns the token and expiration datetime
 * See documentation : https://github.com/auth0/node-jsonwebtoken
 * @private
 * @param { Object } data 
 * @param { String } privateKey 
 * @param { Number } expirationDuration as an integer, given in seconds as jwtExpiration is set in seconds
 */
async function generateToken (data, privateKey, expirationDuration) {
  const expiration = Math.floor(Date.now() / 1000) + parseInt(expirationDuration)
  const token = jwt.sign(
    { exp: expiration,
      data
    },
    privateKey,
    {
      algorithm: 'RS256',
    }
  )
  return { token, expiration }
}

/**
 * Generate a JWT token including given data and 
 * according to private key and duration set in config of the app
 * @param { Object } data
 * @return { Object } An object containing the jwt token and the jwtExpiration datetime
 * @trows An error if an error occurs 
 */
export async function generateJWTToken (data) {
  if (_.isEmpty(data)) throw 'Empty data given to generate token'
  try {
    const { token: jwt, expiration: jwtExpiration } = await generateToken(data, JWT_PRIVATEKEY, JWT_TOKEN_DURATION)
    return { jwt, jwtExpiration }
  } catch (err) {
    console.log(err.message)
    throw err
  }
}

/**
 * Generate a Refresh Token including given data and
 * according to resfresh_token privatekey and duration set in confi of the app
 * @param { Object } data
 * @return { Object } An object containg the refreshtoken and the refreshtoken Expiration
 * @throws An error if an error occurs
 */
export async function generateRefreshToken (data) {
  if (_.isEmpty(data)) throw 'Empty data given to generate token'
  try {
    const { token: refreshToken, expiration: refreshTokenExpiration } =  await generateToken(data, REFRESHTOKEN_PRIVATEKEY, REFRESHTOKEN_DURATION)
    return { refreshToken, refreshTokenExpiration }
  } catch (err) {
    console.log(err.message)
    throw err
  }
}

/**
 * Check the validity of a token according to the key and the token expiration 
 * and return the uncrypted token (clear)
 * @private
 * @param { String } authToken  
 * @param { String } key
 * @return { Object } clearToken 
 */
async function verifyToken (authToken, key) {
  const { clearToken } = await jwt.verify(
    authToken,
    key,
    { algorithms: ['RS256'] },
    function(err, clearToken) {
      if (err) {
        throw err
      }
      return { clearToken }
    }
  )
  return { clearToken }
}

/**
 * Check the validity of a jwt token and return the uncrypted token (clear)
 * @param { String } authToken  
 * @return { Object } clearToken 
 * @throws an error of an error occurs 
 */
export async function verifyJWT (authToken) {
  try {
    const { clearToken } = await verifyToken(authToken, JWT_PUBLICKEY)
    return { clearToken }
  } catch (err) {
    throw err
  }
}

/**
 * Check the validity of a refresh token and return the uncrypted token (clear)
 * @param { String } authToken  
 * @return { Object } clearToken 
 * @throws an error of an error occurs 
 */
export async function verifyRefreshToken (authToken) {
  try {
    const { clearToken } = await verifyToken(authToken, REFRESHTOKEN_PUBLICKEY)
    return { clearToken }
  } catch (err) {
    throw err
  }
}
