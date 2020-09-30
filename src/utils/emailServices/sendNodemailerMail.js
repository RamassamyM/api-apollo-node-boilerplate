import nodemailer from 'nodemailer'
import EmailTemplate from './emailTemplates'
import * as ConfigEmail from '../../configEmail'

const configureMailOptions = async ({ sendingOptions } = { }) => {
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
}

const createAndVerifyTransporter = async sendingOptions => {
  let logger = process.env.NODE_ENV === 'development'
  // create SMTP transporter
  let transporter = await nodemailer.createTransport({ ...sendingOptions, logger: logger, debug: false })
  // verify connection configuration
  await transporter.verify()
  return transporter
}

const sendEmailAndReturnStatus = async (mailContent, transporter) => {
  let responseInfos = await transporter.sendMail(mailContent)
  // if sending is successful, it will define a messageId
  console.log('Message sent: %s', responseInfos.messageId)
  if (process.env.NODE_ENV === 'test') {
    responseInfos.etherealUrl = await nodemailer.getTestMessageUrl(responseInfos)
    // Preview only available when sending through an Ethereal account
    console.log('Preview URL if used with ethereal for testing: %s', responseInfos.etherealUrl)
  }
  return { sendingSuccess: true, responseInfos }
}

/**
 * 
 * @param { Object } param0
 * @param { String } param0.emailTemplateName 
 * @param { Object } param0.mailContentProps 
 * @param { Object } [param0.sendingOptions = {}]
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
