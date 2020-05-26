import nodemailer from 'nodemailer'
import { checkAndConfigureMailOptions } from './checkAndConfigureMailOptions.js'

export const sendEmail = async ({ mailContent, mailOptions }) => {
  try {
    let status = { }
    let options = await checkAndConfigureMailOptions({ mailOptions })
    console.log(options)
    const transporter = await nodemailer.createTransport(options)
    const success = await transporter.verify()
    status.verifySMTPServerReady = success
    console.log('Verification of SMTP server authentication: ', success)
    const info = await transporter.sendMail(mailContent)
    status.sendingSuccess = true
    if (info && info.messageId) {
      console.log('Message sent: %s', info.messageId)
      // Preview only available when sending through an Ethereal account
      console.log('Preview URL if used with ethereal for testing: %s', nodemailer.getTestMessageUrl(info))
    }
    return status
  } catch (error) {
    console.log(error)
    return { sendingSuccess: false, error: error.message}
  }
}