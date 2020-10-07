/**
 * @module encryption
 * @requires crypto
 */
import crypto from 'crypto'
// const crypto = require('crypto')
import { CRYPTOPASSWORD } from '../config'

const algorithm = 'aes-256-cbc'
const key = crypto.scryptSync(CRYPTOPASSWORD, 'salt', 32)
const iv = crypto.randomBytes(16)

/**
 * Encrypt a text using crypto package and returns the encryptedData string and the iv string
 * @param { String } text 
 * @return { Object } an object containing the iv hex string and the encryptedData hex string
 * @throws an error
 */
export function encrypt(text) {
  try {
    let cipher = crypto.createCipheriv(algorithm, key, iv)
    let encrypted = cipher.update(text)
    encrypted = Buffer.concat([encrypted, cipher.final()])
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') }
  } catch (err) {
    console.log(err)
    throw err
  }
}

/**
 * Decrypt an object text using crypto package and returns the decrypted text
 * @param { Object } text
 * @param { String } text.iv
 * @param { String } text.encryptedData
 * @return { String } Decrypted text
 * @throws an error
 */
export function decrypt(text) {
  try {
    let iv = Buffer.from(text.iv, 'hex')
    let encryptedText = Buffer.from(text.encryptedData, 'hex')
    let decipher = crypto.createDecipheriv(algorithm, key, iv)
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString()
  } catch (err) {
    console.log(err)
    throw err
  }
}
