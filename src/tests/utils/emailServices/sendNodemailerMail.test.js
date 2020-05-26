import { sendEmail } from '../../../utils/emailServices/sendNodemailerMail'
import { SMTP_DEFAULT_SECURE, SMTP_DEFAULT_HOST, SMTP_DEFAULT_PORT, SMTP_DEFAULT_USER, SMTP_DEFAULT_PASS } from '../../../config'

jest.mock('../../../utils/emailServices/checkAndConfigureMailOptions')
import { checkAndConfigureMailOptions } from '../../../utils/emailServices/checkAndConfigureMailOptions'

afterEach(() =>  {
  jest.clearAllMocks()
})

describe('Simulating sending email with nodemailer', () => {
  test('should prepare sending an email with good infos provided and should return a success status', async (done) => {
    checkAndConfigureMailOptions.mockReturnValue(Promise.resolve(
      {
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: 'user',
          pass: 'pass'
        },
        async send(data, callback) {
          try {
            expect(data.data.from).toContain("<contact@myapp.com>")
            expect(data.data.html).toContain('Mika')
            expect(data.data.html).toContain('http://myapp/newPassword/1234')
            expect(data.data.text).toContain('Mika')
            expect(data.data.text).toContain('http://myapp/newPassword/1234')
            expect(data.data.to).toBe("<sunsmiley@live.fr")
          } catch (error) {
            done(error)
          }
          callback()
        }
      }
    ))
    const mailContent = {
      from: "<contact@myapp.com>",
      to: "<sunsmiley@live.fr",
      subject: "Changing forgotten password ✔", 
      text: `Hello Mika, here is the link to change your password: http://myapp/newPassword/1234`,
      html: `<b>Hello Mika,</b><p>Here is the link to change your password: <p><a href="http://myapp/newPassword/1234">CHANGE PASSWORD</a>`
    }
    const mailOptions = {}
    const status = await sendEmail({ mailContent, mailOptions })
    expect(status).toMatchObject({
      sendingSuccess: true,
    })
    done()
  })
  test('should return a truthy verification of SMTP server with good authentication infos', async (done) => {
    checkAndConfigureMailOptions.mockReturnValue(Promise.resolve(
      {
        host: SMTP_DEFAULT_HOST,
        port : SMTP_DEFAULT_PORT,
        secure: SMTP_DEFAULT_SECURE,
        auth: {
          user: SMTP_DEFAULT_USER, 
          pass: SMTP_DEFAULT_PASS
        },
        async send(data, callback) {
          try {
            expect(data.data.from).toContain("<contact@myapp.com>")
            expect(data.data.html).toContain('Mika')
            expect(data.data.html).toContain('http://myapp/newPassword/1234')
            expect(data.data.text).toContain('Mika')
            expect(data.data.text).toContain('http://myapp/newPassword/1234')
            expect(data.data.to).toBe("<sunsmiley@live.fr")
          } catch (error) {
            done(error)
          }
          callback()
        }
      }
    ))
    const mailContent = {
      from: "<contact@myapp.com>",
      to: "<sunsmiley@live.fr",
      subject: "Changing forgotten password ✔", 
      text: `Hello Mika, here is the link to change your password: http://myapp/newPassword/1234`,
      html: `<b>Hello Mika,</b><p>Here is the link to change your password: <p><a href="http://myapp/newPassword/1234">CHANGE PASSWORD</a>`
    }
    const mailOptions = {}
    const status = await sendEmail({ mailContent, mailOptions })
    expect(status).toMatchObject({
      sendingSuccess: true,
      verifySMTPServerReady: true
    })
    done()
  })
})