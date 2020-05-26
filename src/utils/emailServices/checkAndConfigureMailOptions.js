import nodemailer from 'nodemailer'
import { SMTP_DEFAULT_SECURE, SMTP_DEFAULT_HOST, SMTP_DEFAULT_PORT, SMTP_DEFAULT_USER, SMTP_DEFAULT_PASS } from '../../config'

const configureMailOptionsForTesting = async () => {
  const testAccount = await nodemailer.createTestAccount()
  return {
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass // generated ethereal password
    }
  }
} 

const configureDefaultMailOptions = () => {
  return {
    host: SMTP_DEFAULT_HOST,
    port : SMTP_DEFAULT_PORT, 
    secure: SMTP_DEFAULT_SECURE,
    auth: {
      user: SMTP_DEFAULT_USER, 
      pass: SMTP_DEFAULT_PASS
    }
  }
} 

export const checkAndConfigureMailOptions = async ({ mailOptions } = { }) => {
  let options
  if (process.env.NODE_ENV !== 'production') {
    options = await configureMailOptionsForTesting()
  } else if (mailOptions && mailOptions.host && mailOptions.port && mailOptions.auth && mailOptions.auth.user && mailOptions.auth.pass) {
    options = mailOptions
  } else {
    options = await configureDefaultMailOptions()
  }
  return options
}