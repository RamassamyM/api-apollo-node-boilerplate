import { DEFAULT_SENDER_EMAIL, DEFAULT_SENDER_NAME } from '../../configEmail'

export default class EmailTemplate {
  
  /**
   * Generate the email template for the forgotten password email
   * @param { Object } param0
   * @param { Object } [param0.sender = {}] sender is an object with name and email props, will use defaults if not provided
   * @param { String } param0.receiverEmail
   * @param { String } param0.receiverUsername
   * @param { String } param0.passlinkUrl the link sent in an email and used by a user to create a new password
   * @return { Object } An object containing all parameters for the email content (ex : from, to, subject, text, html )
   * @throws error if some parameters are missing
   */
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
