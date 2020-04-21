import jwt from 'jsonwebtoken'
import { JWT_PRIVATEKEY, REFRESHTOKEN_PRIVATEKEY, JWT_TOKEN_DURATION, REFRESHTOKEN_DURATION } from '../config'

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
  try {
    const { token: jwt, expiration: jwtExpiration } = await generateToken(data, JWT_PRIVATEKEY, JWT_TOKEN_DURATION)
    return { jwt, jwtExpiration }
  } catch (err) {
    console.log(err.message)
    throw err
  }
}

export async function generateRefreshToken (data) {
  try {
    const { token: refreshToken, expiration: refreshTokenExpiration } =  await generateToken(data, REFRESHTOKEN_PRIVATEKEY, REFRESHTOKEN_DURATION)
    return { refreshToken, refreshTokenExpiration }
  } catch (err) {
    console.log(err.message)
    throw err
  }
}
