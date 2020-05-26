import jwt from 'jsonwebtoken'
import { JWT_PUBLICKEY, REFRESHTOKEN_PUBLICKEY, JWT_PRIVATEKEY, REFRESHTOKEN_PRIVATEKEY, JWT_TOKEN_DURATION, REFRESHTOKEN_DURATION } from '../config'
import _ from 'lodash'

// See documentation : https://github.com/auth0/node-jsonwebtoken
// expirationDuration is given in sec, jwtExpiration is set in sec
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

export async function verifyJWT (authToken) {
  try {
    const { clearToken } = await verifyToken(authToken, JWT_PUBLICKEY)
    return { clearToken }
  } catch (err) {
    throw err
  }
}

export async function verifyRefreshToken (authToken) {
  try {
    const { clearToken } = await verifyToken(authToken, REFRESHTOKEN_PUBLICKEY)
    return { clearToken }
  } catch (err) {
    throw err
  }
}
