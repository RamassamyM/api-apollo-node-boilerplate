require('dotenv').config()
import nodemailer from 'nodemailer'

export const EMAIL_HOST = process.env.EMAIL_HOST
export const EMAIL_PORT = process.env.EMAIL_PORT
export const SMTP_EMAIL_USER = process.env.SMTP_EMAIL_USER
export const SMTP_EMAIL_PASS = process.env.SMTP_EMAIL_PASS

async function configureMailOptions() {
  try {
    let mailConfig = {}
    const testing = process.env.NODE_ENV === 'test'
    if (EMAIL_HOST && EMAIL_PORT && SMTP_EMAIL_USER && SMTP_EMAIL_PASS && !testing) {
      mailConfig = {
        host: EMAIL_HOST,
        port: EMAIL_PORT,
        secure: false,
        auth: {
          user: SMTP_EMAIL_USER,
          pass: SMTP_EMAIL_PASS,
        }
      }
    } else {
      // Generate test SMTP service account from ethereal.email if no real email account for testing
      let testAccount = await nodemailer.createTestAccount()
      mailConfig = {
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass // generated ethereal password
        }
      }
    }
    return mailConfig
  } catch (err) {
    console.log("ERROR [configureMailProperties()]: ",err)
    throw err
  }
}

export const MAILER = {
  options: configureMailOptions(),
  from: {
    defaultSenderName: process.env.DEFAULT_SENDER_NAME || "MyApp Team",
    defaultSenderEmail: process.env.DEFAULT_SENDER_EMAIL || "contact@myapp.com"
  },
  emailHost: process.env.EMAIL_HOST,
  emailPort: process.env.EMAIL_PORT,
  SmtpEmailuser: process.env.SMTP_EMAIL_USER,
  SmtpEmailPass: process.env.SMTP_EMAIL_PASS,
}