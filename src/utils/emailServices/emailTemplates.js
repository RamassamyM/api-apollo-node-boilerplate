import { DEFAULT_SENDER_EMAIL, DEFAULT_SENDER_NAME } from '../../configEmail'

export default class EmailTemplate {
  
  forgottenPassword({ sender = {}, receiverEmail, receiverUsername, passlinkUrl }) {
    if (!receiverEmail || !receiverUsername || !passlinkUrl) {
      throw new Error ('Parameters missing to send forgotten password email')
    }
    let from
    if (sender && sender.name && sender.email) {
      from = `"${sender.name}" <${sender.email}>`
    } else {
      from = `"${DEFAULT_SENDER_NAME}" <${DEFAULT_SENDER_EMAIL}>`
    }
    return  {
      from: from,
      to: receiverEmail,
      subject: "Changing forgotten password ✔", 
      text: `Hello ${receiverUsername}, here is the link to change your password: ${passlinkUrl}`,
      html: `<b>Hello ${receiverUsername},</b><p>Here is the link to change your password: <p><a href="${passlinkUrl}">CHANGE PASSWORD</a>`
    }
  }

}
