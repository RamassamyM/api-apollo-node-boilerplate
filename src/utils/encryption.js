import crypto from 'crypto'
// const crypto = require('crypto')
import { CRYPTOPASSWORD } from '../config'

const algorithm = 'aes-256-cbc'
const key = crypto.scryptSync(CRYPTOPASSWORD, 'salt', 32)
const iv = crypto.randomBytes(16)

export function encrypt(text) {
  let cipher = crypto.createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') }
}

export function decrypt(text) {
  let iv = Buffer.from(text.iv, 'hex')
  let encryptedText = Buffer.from(text.encryptedData, 'hex')
  let decipher = crypto.createDecipheriv(algorithm, key, iv)
  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString()
}
