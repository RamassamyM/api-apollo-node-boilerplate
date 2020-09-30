require('dotenv').config()
import nodemailer from 'nodemailer'

export const SMTP_DEFAULT_HOST = process.env.SMTP_DEFAULT_HOST
export const SMTP_DEFAULT_PORT = parseInt(process.env.SMTP_DEFAULT_PORT, 10)
export const SMTP_DEFAULT_USER = process.env.SMTP_DEFAULT_USER
export const SMTP_DEFAULT_PASS = process.env.SMTP_DEFAULT_PASS
export const TEST_EMAIL_HOST = process.env.TEST_EMAIL_HOST || "smtp.ethereal.email"
export const TEST_EMAIL_PORT = parseInt(process.env.TEST_EMAIL_PORT, 10) || 587
export const SMTP_SECURE = process.env.SMTP_SECURE === "true"
export const DEFAULT_SENDER_NAME = process.env.DEFAULT_SENDER_NAME || "MyApp Team"
export const DEFAULT_SENDER_EMAIL = process.env.DEFAULT_SENDER_EMAIL || "contact@myapp.com"

/**
 * Returns the SMTP mailing parameters according to environment variables (host, port, user, pass) set 
 * or generate test SMTP environment with nodemailer with test parameters 
 * or throw an error
 * @return { Object } An Object containing SMTP parameters like host port secure and auth as an object with user and pass
 * @throws Will throw and error if a problem occur, for exemple with nodemailer.createTestAccount()
 */
export const MAILER = async () => {
  try {
    const testing = process.env.NODE_ENV === 'test'
    if (SMTP_DEFAULT_HOST && SMTP_DEFAULT_PORT && SMTP_DEFAULT_USER && SMTP_DEFAULT_PASS && !testing) {
      return {
        host: SMTP_DEFAULT_HOST,
        port: SMTP_DEFAULT_PORT,
        secure: SMTP_SECURE,
        auth: {
          user: SMTP_DEFAULT_USER,
          pass: SMTP_DEFAULT_PASS,
        }
      }
    } else {
      // Generate test SMTP service account from ethereal.email if no real email account for testing
      let testAccount = await nodemailer.createTestAccount()
      return {
        host: TEST_EMAIL_HOST,
        port: TEST_EMAIL_PORT,
        secure: SMTP_SECURE, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass // generated ethereal password
        }
      }
    }
  } catch (err) {
    console.log("ERROR [configureSMTPoptions]: ",err)
    throw err
  }
}