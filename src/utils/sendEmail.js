import nodemailer from 'nodemailer'
import { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } from '../config'
// async..await is not allowed in global scope, must use a wrapper
export async function sendForgotPasswordEmail({ email, receiver, passlinkUrl } = {}) {
  try {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount()
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: EMAIL_HOST || "smtp.ethereal.email",
      port: EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: EMAIL_USER || testAccount.user, // generated ethereal user
        pass: EMAIL_PASS || testAccount.pass // generated ethereal password
      }
    })
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"MyApp" <contact@myapp.com>', // sender address
      to: 'ramassamymichael@gmail.com', // list of receivers
      subject: "Changing forgotten password ✔", // Subject line
      text: `Hello ${receiver.username}, here is the link to change your password: ${passlinkUrl}`, // plain text body
      html: `<b>Hello ${receiver.username},</b><p>Here is the link to change your password: <p><a href="${passlinkUrl}">CHANGE PASSWORD</a>` // html body
    })

    console.log("Message sent: %s", info.messageId)
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  } catch (e) {
    console.log(e)
  }
}
