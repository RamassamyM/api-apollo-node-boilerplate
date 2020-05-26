import { encrypt, decrypt } from '../../utils/encryption'
import _ from 'lodash'

describe('Encryption Service', function() {
  describe('Encrypt text', function() {
    test('should return an object with keys iv and encryptedData', ()=> {
      const text = "ASecretPassword1234"
      const encryptedText = encrypt(text)
      expect(_.isObject(encryptedText)).toBe(true)
      expect(encryptedText.iv).toBeTruthy()
      expect(encryptedText.encryptedData).toBeTruthy()
    })
    test('should not return the same uncrypted text as encrypted data', ()=> {
      const text = "ASecretPassword1234"
      const encryptedData = encrypt(text).encryptedData
      expect(encryptedData).not.toBe(text)
    })
  })
  describe('Decrypt an object containing the encrypted text', function() {
    test('should return a String', ()=> {
      const text = {
        iv: 'aadd380a57697ed279a8807c8d4c5c20',
        encryptedData: 'dd1759eee06855428cd8b39758e9185bb65f6cae2a46ea4cee806b27f9e3576d'
      }
      const decryptedText = decrypt(text)
      expect(_.isString(decryptedText)).toBe(true)
    })
    test('should return the good uncrypted text', ()=> {
      const uncryptedText = "ASecretPassword1234"
      const text = {
        iv: 'aadd380a57697ed279a8807c8d4c5c20',
        encryptedData: 'dd1759eee06855428cd8b39758e9185bb65f6cae2a46ea4cee806b27f9e3576d'
      }
      const decryptedText = decrypt(text)
      expect(decryptedText).toBe(uncryptedText)
    })
    test('should throw an exception if iv given is not of the good size', () => {
      const text = {
        iv: 'aadd380a57697ed279a8807c8d4c5c2',
        encryptedData: 'dd1759eee06855428cd8b39758e9185bb65f6cae2a46ea4cee806b27f9e3576d'
      }
      const decryptedText = () => decrypt(text)
      expect(decryptedText).toThrowError('Invalid IV length')
    })
    test('should return another uncrypted text if iv different than the one given when encrypting', () => {
      const uncryptedText = "ASecretPassword1234"
      const text = {
        iv: 'aadd3aba37597ed279a8807c8d4c5c21',
        encryptedData: 'dd1759eee06855428cd8b39758e9185bb65f6cae2a46ea4cee806b27f9e3576d'
      }
      const decryptedText = () => decrypt(text)
      expect(decryptedText).not.toBe(uncryptedText)
    })
    test('should throw an exception if iv is absent in object text given', () => {
      const text = {
        encryptedData: 'dd1759eee06855428cd8b39758e9185bb65f6cae2a46ea4cee806b27f9e3576d'
      }
      const decryptedText = () => decrypt(text)
      expect(decryptedText).toThrowError()
    })
    test('should throw an exception if encryptedData is absent in object text given', () => {
      const text = {
        iv: 'aadd3aba37597ed279a8807c8d4c5c21'
      }
      const decryptedText = () => decrypt(text)
      expect(decryptedText).toThrowError()
    })
  })
  describe('Decrypt an encrypted text', function() {
    test('should return the same initial text', ()=> {
      const text = "ASecretPassword1234"
      const encryptedText = encrypt(text)
      const decryptedText = decrypt(encryptedText)
      expect(decryptedText).toBe(text)
    })
  })
})