/**
 * @module sendNodemailerMail
 * @requires nodemailer
 */
import nodemailer from 'nodemailer'
import EmailTemplate from './emailTemplates'
import * as ConfigEmail from '../../configEmail'

/**
 * Return Options for nodemailer sending by checking validity and existence of sending options 
 * or use the options in ConfigEmail.MAILER
 * @param { Object } param0
 * @param { Object } [param0.sendingOptions = {}] An object with host, port, auth(user, pass) parameters
 * @return { Object } An object containing sendingOptions object (host, port, auth(user, pass))
 */
const configureMailOptions = async ({ sendingOptions } = { }) => {
  try {
    if (sendingOptions && sendingOptions.host && sendingOptions.port && sendingOptions.auth && sendingOptions.auth.user && sendingOptions.auth.pass) {
      // check if sendingOptions provided are complete before using them
      return {
        ...sendingOptions,
        secure: ConfigEmail.SMTP_SECURE,
      }
    } else {
      // if sendingOptions provided are incomplete, use options defined in configEmail.js (default or test)
      sendingOptions = await ConfigEmail.MAILER()
      return sendingOptions
    }
  } catch (error) {
    throw error
  }
}

/**
 * Create and return Nodemailer transporter after checking validity of transporter created with given parameters
 * Add a logger if development environment
 * @param { Object } sendingOptions An object containing host, ort, auth (user, pass)
 * @throws error
 */
const createAndVerifyTransporter = async sendingOptions => {
  try {
    let logger = process.env.NODE_ENV === 'development'
    // create SMTP transporter
    let transporter = await nodemailer.createTransport({ ...sendingOptions, logger: logger, debug: false })
    // verify connection configuration
    await transporter.verify()
    return transporter
  } catch (error) {
    throw error
  }
}

/**
 * Send the Email with the given transporter and return the status
 * @param { Object } mailContent An object containing all parameters for the email content (ex : from, to, subject, text, html ) 
 * @param { Instance } transporter An instance of the transporter class from nodemailer that is used to send email
 * @return { Object } An object containing boolean sendingSuccess and responseInfos object
 * @throws error
 */
const sendEmailAndReturnStatus = async (mailContent, transporter) => {
  try {
    let responseInfos = await transporter.sendMail(mailContent)
    // if sending is successful, it will define a messageId
    console.log('Message sent: %s', responseInfos.messageId)
    if (process.env.NODE_ENV === 'test') {
      responseInfos.etherealUrl = await nodemailer.getTestMessageUrl(responseInfos)
      // Preview only available when sending through an Ethereal account
      console.log('Preview URL if used with ethereal for testing: %s', responseInfos.etherealUrl)
    }
    return { sendingSuccess: true, responseInfos }
  } catch (error) {
    throw error
  }
}

/**
 * SendEmail with Nodemailer
 * @param { Object } param0
 * @param { String } param0.emailTemplateName 
 * @param { Object } param0.mailContentProps 
 * @param { Object } [param0.sendingOptions = {}]
 * @return {Object } An object with sendingSuccess as boolean and responseInfos (message url if test) coming from nodemailer
 */
export const sendEmail = async ({ emailTemplateName, mailContentProps, sendingOptions = {} }) => {
  try {
    // instantiate an EmailTemplate object to access the good emailTemplate generator method
    let emailTemplate = new EmailTemplate()
    // generate the good email content according to the emailtemplateName provided
    let mailContent = emailTemplate[emailTemplateName](mailContentProps)
    // configure mail options to create a nodemailer SMTP transporter
    sendingOptions = await configureMailOptions({ sendingOptions })
    // create the nodemailer transporter
    let transporter = await createAndVerifyTransporter(sendingOptions)
    // sendEmail and return the status with sendingSuccess and infos
    return sendEmailAndReturnStatus(mailContent, transporter)
  } catch (error) {
    console.log('Error in sending: ', error.message)
    return { sendingSuccess: false, error: error.message }
  }
}
