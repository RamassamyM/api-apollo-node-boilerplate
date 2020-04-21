const crypto = require('crypto')
const algorithm = 'aes-256-cbc'
import { CRYPTOPASSWORD } from '../config'

const key = crypto.scryptSync(CRYPTOPASSWORD, 'salt', 32)
const iv = crypto.randomBytes(16)

export function encrypt(text) {
  let cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') }
}

export function decrypt(text) {
  let iv = Buffer.from(text.iv, 'hex')
  let encryptedText = Buffer.from(text.encryptedData, 'hex')
  let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString()
}
