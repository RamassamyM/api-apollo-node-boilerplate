import { verifyJWT } from '../../utils/generateAndVerifyToken'
import { AuthenticationError } from 'apollo-server-errors'
import User from '../../models/user.model'

async function getTokenFromRequest (req) {
  const authorization = await req.headers['authorization']
  if (authorization) {
    const authToken = await authorization.replace('Bearer ', '')
    return authToken
  }
  throw new AuthenticationError('ERROR Authentication failed while searching token')
}

export default async function getCurrentUserfromJwtToken (req) {
  let authToken = ''
  // let clearToken = null
  let currentUser = null
  // let isTokenValid = false
  try {
    authToken = await getTokenFromRequest(req)
    if (!!authToken) {
      const { clearToken } = await verifyJWT(authToken)
      if (!!clearToken) {
        currentUser = await User.findById(clearToken.data._id)
        if (!!currentUser) {
          console.log(`SUCCESS authentication : ${currentUser.username}`)
          // isTokenValid = true
        } else {
          currentUser = null
          console.log(`ERROR Unable to authenticate : user does not exist: ${clearToken.data._id}`)
        }
      }
    }
  } catch (err) {
    // if (err.message === "Token invalid") {
      // isTokenValid = false
    // }
    const authTokenFragment = () => { if (typeof(authToken) === 'string') { return authToken.substring(0, 30) } return ''}
    console.warn(`${err.message} : ${authTokenFragment()}...`)
  }
  // return { clearToken, currentUser, isTokenValid }
  return { currentUser }
}
