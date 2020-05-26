import { generateForgottenPasswordContent } from './emailTemplates/forgottenPasswordTemplate'
import { sendEmail } from './sendNodemailerMail'

export const sendForgottenPasswordEmail = async ({ sender, receiver, passlinkUrl, mailOptions }) => {
  try {
    const mailContent = await generateForgottenPasswordContent({ sender, receiver, passlinkUrl})
    if (!mailContent) {
      return { sendingSuccess: false }
    }
    const status = await sendEmail({ mailContent, mailOptions })
    return status
  } catch (error) {
    console.log(error)
    throw error
  }
}