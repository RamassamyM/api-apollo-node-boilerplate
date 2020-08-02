import { sendEmail } from '../../../../utils/emailServices/sendNodemailerMail'
import nodemailer from 'nodemailer'
import * as ConfigEmail from '../../../../configEmail'

describe('Email service', () => {
  describe('Sending email with nodemailer', () => {
    test('should return a success status and an ethereal link when email is sent in test environment ', async (done) => {
      expect.assertions(2)
      let status = await sendEmail({ emailTemplateName: 'forgottenPassword', mailContentProps: { receiverEmail: 'sunsmiley@live.fr', receiverUsername: 'Mika', passlinkUrl: 'http://myapp/newPassword/1234' } })
      expect(status).toMatchObject({ sendingSuccess: true })
      expect(status.responseInfos.etherealUrl).toBeDefined()
      done()
    })
    test('should return an error status if SMTP authentification failed', async (done) => {
      let status = await sendEmail({ 
        sendingOptions: {
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false, 
          auth: {
            user: 'user', 
            pass: 'pass' 
          }
        }, 
        emailTemplateName: 'forgottenPassword', 
        mailContentProps: { 
          receiverEmail: 'sunsmiley@live.fr', 
          receiverUsername: 'Mika', 
          passlinkUrl: 'http://myapp/newPassword/1234' 
        } 
      })
      expect(status).toMatchObject({ sendingSuccess: false, error: "Invalid login: 535 Authentication failed" })
      done()
    })
    test('should return an error status if SMTP host failed', async (done) => {
      expect.assertions(1)
      let status = await sendEmail({ 
        sendingOptions: {
          host: 'smtp.ethereal.mail',
          port: 587,
          secure: false, 
          auth: {
            user: 'user', 
            pass: 'pass' 
          }
        }, 
        emailTemplateName: 'forgottenPassword', 
        mailContentProps: { 
          receiverEmail: 'sunsmiley@live.fr', 
          receiverUsername: 'Mika', 
          passlinkUrl: 'http://myapp/newPassword/1234' 
        } 
      })
      expect(status).toMatchObject({ sendingSuccess: false, error: expect.any(String) })
      done()
    })
  })

  describe('Simulating sending email with nodemailer mocks', () => {
    const verify = jest.fn(() => true)
    const sendMail = jest.fn( (mailContent) => {
      return { messageId: 'messageIdMock' }
    })
    
    beforeAll(() => {
      nodemailer.createTransport = jest.fn((sendingOptions) => { 
        return { sendingOptions, verify: () => verify(), sendMail: (mailContent) => sendMail(mailContent) } 
      })
      nodemailer.getTestMessageUrl = jest.fn(responseInfos => 'etherealUrlMock')
    })

    beforeEach(() => {
      jest.clearAllMocks()
    })

    afterAll(() => {
      jest.restoreAllMocks()
    })

    test('should create a transporter by calling nodemailer.createTransport method', async (done) => {
      expect.assertions(1)
      // const addMock = jest.spyOn(nodemailer, "createTransport")
      await sendEmail({ emailTemplateName: 'forgottenPassword', 
                        mailContentProps: { 
                          receiverEmail: 'sunsmiley@live.fr', 
                          receiverUsername: 'Mika', 
                          passlinkUrl: 'http://myapp/newPassword/1234' 
                        } 
                      })
      expect(nodemailer.createTransport.mock).toBeTruthy()
      done()
    })

    test('should call nodemailer.createTransport with options parameters: host, port, secure, auth.user, auth.pass', async (done) => {
      expect.assertions(1)
      await sendEmail({ emailTemplateName: 'forgottenPassword', 
                        mailContentProps: { 
                          receiverEmail: 'sunsmiley@live.fr', 
                          receiverUsername: 'Mika', 
                          passlinkUrl: 'http://myapp/newPassword/1234' 
                        } 
                      })
      expect(nodemailer.createTransport).toHaveBeenCalledWith(expect.objectContaining({
        host: expect.any(String),
        port: expect.any(Number),
        secure: expect.any(Boolean),
        auth: expect.objectContaining({
          user: expect.any(String),
          pass: expect.any(String)
        })
      }))
      done()
    })

    test('should create a transporter with ethereal configuration in test mode', async (done) => {
      expect.assertions(1)
      await sendEmail({ emailTemplateName: 'forgottenPassword', 
                        mailContentProps: { 
                          receiverEmail: 'sunsmiley@live.fr', 
                          receiverUsername: 'Mika', 
                          passlinkUrl: 'http://myapp/newPassword/1234' 
                        } 
                      })
      expect(nodemailer.createTransport).toHaveBeenCalledWith(expect.objectContaining({
        host: ConfigEmail.TEST_EMAIL_HOST,
        port: ConfigEmail.TEST_EMAIL_PORT,
      }))
      done()
    })

    test('should call nodemailer.createTransport with the default configuration in a production environment without options given', async (done) => {
      expect.assertions(1)
      process.env.NODE_ENV = 'production'
      await sendEmail({ emailTemplateName: 'forgottenPassword', 
                        mailContentProps: { 
                          receiverEmail: 'sunsmiley@live.fr', 
                          receiverUsername: 'Mika', 
                          passlinkUrl: 'http://myapp/newPassword/1234' 
                        } 
                      })
      expect(nodemailer.createTransport).toHaveBeenCalledWith(expect.objectContaining({
        host: ConfigEmail.SMTP_DEFAULT_HOST,
        port: ConfigEmail.SMTP_DEFAULT_PORT,
        secure: ConfigEmail.SMTP_SECURE,
        auth: {
          user: ConfigEmail.SMTP_DEFAULT_USER,
          pass: ConfigEmail.SMTP_DEFAULT_PASS,
        }
      }))
      process.env.NODE_ENV = 'test'
      done()
    })

    test('should call nodemailer.createTransport with the default configuration if options given are incomplete in production', async (done) => {
      expect.assertions(1)
      process.env.NODE_ENV = 'production'
      await sendEmail({ emailTemplateName: 'forgottenPassword', 
                        mailContentProps: { 
                          receiverEmail: 'sunsmiley@live.fr', 
                          receiverUsername: 'Mika', 
                          passlinkUrl: 'http://myapp/newPassword/1234' 
                        },
                        sendingOptions: {
                          host: 'host',
                        }
                      })
      expect(nodemailer.createTransport).toHaveBeenCalledWith(expect.objectContaining({
        host: ConfigEmail.SMTP_DEFAULT_HOST,
        port: ConfigEmail.SMTP_DEFAULT_PORT,
        secure: false,
        auth: {
          user: ConfigEmail.SMTP_DEFAULT_USER,
          pass: ConfigEmail.SMTP_DEFAULT_PASS,
        }
      }))
      process.env.NODE_ENV = 'test'
      done()
    })

    test('should call nodemailer.createTransport with the configuration given if options given are complete in production', async (done) => {
      expect.assertions(1)
      process.env.NODE_ENV = 'production'
      await sendEmail({ sendingOptions: { 
                        host: 'host', 
                        port: 588, 
                        auth: { 
                          user: 'user', 
                          pass:'pass' 
                        }
                      }, 
                      emailTemplateName: 'forgottenPassword', 
                      mailContentProps: { 
                        receiverEmail: 'sunsmiley@live.fr', 
                        receiverUsername: 'Mika', 
                        passlinkUrl: 'http://myapp/newPassword/1234' 
                      } 
                    })
      expect(nodemailer.createTransport).toHaveBeenCalledWith(expect.objectContaining({
        host: 'host',
        port: 588,
        secure: false,
        auth: {
          user: 'user',
          pass: 'pass',
        }
      }))
      process.env.NODE_ENV = 'test'
      done()
    })

    test('should verify transporter created by calling transporter.verify method', async (done) => {
      expect.assertions(1)
      await sendEmail({ emailTemplateName: 'forgottenPassword', 
                        mailContentProps: { 
                          receiverEmail: 'sunsmiley@live.fr', 
                          receiverUsername: 'Mika', 
                          passlinkUrl: 'http://myapp/newPassword/1234' 
                        } 
                      })
      expect(verify).toBeTruthy()
      done()
    })

    test('should call nodemailer transporter.sendMail method', async (done) => {
      expect.assertions(1)
      await sendEmail({ emailTemplateName: 'forgottenPassword', 
                        mailContentProps: { 
                          receiverEmail: 'sunsmiley@live.fr', 
                          receiverUsername: 'Mika', 
                          passlinkUrl: 'http://myapp/newPassword/1234' 
                        } 
                      })
      expect(sendMail).toBeTruthy()
      done()
    })

    test('should call transporter.sendMail of nodemailer with content parameters : from, to, subject, text, html', async (done) => {
      expect.assertions(1)
      await sendEmail({ emailTemplateName: 'forgottenPassword', 
                        mailContentProps: { 
                          receiverEmail: 'sunsmiley@live.fr', 
                          receiverUsername: 'Mika', 
                          passlinkUrl: 'http://myapp/newPassword/1234' 
                        } 
                      })
      expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({
        from: expect.any(String),
        to: expect.any(String),
        subject: expect.any(String),
        text: expect.any(String),
        html: expect.any(String),
      }))
      done()
    })
    test('should call transporter.sendMail of nodemailer with good infos : to', async (done) => {
      expect.assertions(1)
      await sendEmail({ emailTemplateName: 'forgottenPassword', 
                        mailContentProps: { 
                          receiverEmail: 'sunsmiley@live.fr', 
                          receiverUsername: 'Mika', 
                          passlinkUrl: 'http://myapp/newPassword/1234' 
                        } 
                      })
      expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'sunsmiley@live.fr',
      }))
      done()
    })
    test('should call transporter.sendMail of nodemailer with default sender if sender is not given', async (done) => {
      expect.assertions(1)
      await sendEmail({ emailTemplateName: 'forgottenPassword', 
                        mailContentProps: { 
                          receiverEmail: 'sunsmiley@live.fr', 
                          receiverUsername: 'Mika', 
                          passlinkUrl: 'http://myapp/newPassword/1234' 
                        } 
                      })
      expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({
        from: `"${ConfigEmail.DEFAULT_SENDER_NAME}" <${ConfigEmail.DEFAULT_SENDER_EMAIL}>`,
      }))
      done()
    })
    test('should return sendingSuccess false if receiver is not given when calling sendEmail', async (done) => {
      expect.assertions(1)
      const status = await sendEmail({ emailTemplateName: 'forgottenPassword', 
        mailContentProps: { 
          passlinkUrl: 'http://myapp/newPassword/1234' 
        }
      })
      expect(status).toMatchObject({
        sendingSuccess: false
      })
      done()
    })
  })
})