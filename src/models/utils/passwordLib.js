import bcryptjs from 'bcryptjs'

/**
 * Convert and return a password in a crypted password hashed with bcrypt 
 * @param { String } passwordString 
 * @return { String } hashed password
 */
export function hashPassword (passwordString) {
  return bcryptjs.hash(passwordString, 10)
}

/**
 * Compare a given password with a hashed password and return boolean result
 * @param { String } password1 
 * @param { String } password2
 * @return { Boolean } result of comparison
 */
export function comparePassword (password1, password2) {
  return bcryptjs.compare(password1, password2)
}
