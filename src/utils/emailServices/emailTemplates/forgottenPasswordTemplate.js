import { DEFAULT_EMAIL_SENDER_EMAIL, DEFAULT_EMAIL_SENDER_NAME } from '../../../config'

export const generateForgottenPasswordContent = ({ sender, receiver, passlinkUrl }) => {
  if (!receiver || !receiver.email || !receiver.username || !passlinkUrl) {
    return false
  }
  let from
  if (sender && sender.name && sender.email) {
    from = `"${sender.name}" <${sender.email}>`
  } else {
    from = `"${DEFAULT_EMAIL_SENDER_NAME}" <${DEFAULT_EMAIL_SENDER_EMAIL}>`
  }
  return  {
    from: from,
    to: receiver.email,
    subject: "Changing forgotten password ✔", 
    text: `Hello ${receiver.username}, here is the link to change your password: ${passlinkUrl}`,
    html: `<b>Hello ${receiver.username},</b><p>Here is the link to change your password: <p><a href="${passlinkUrl}">CHANGE PASSWORD</a>`
  }
}