import jwt from 'jsonwebtoken'
import { JWT_PUBLICKEY, REFRESHTOKEN_PUBLICKEY } from '../config'
import { AuthenticationError } from 'apollo-server-errors'

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
