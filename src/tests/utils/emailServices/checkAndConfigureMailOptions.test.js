import { checkAndConfigureMailOptions } from '../../../utils/emailServices/checkAndConfigureMailOptions'
import { SMTP_DEFAULT_SECURE, SMTP_DEFAULT_HOST, SMTP_DEFAULT_PORT, SMTP_DEFAULT_USER, SMTP_DEFAULT_PASS } from '../../../config'

describe('Configure correctly options for sending email', () => {
  test('should return an ethereal configuration if a test environment', async () => {
    process.env.NODE_ENV = 'test'
    const options = await checkAndConfigureMailOptions()
    expect(options).toStrictEqual({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: expect.any(String), 
        pass: expect.any(String) 
      }
    })
  })
  test('should return an ethereal configuration if a development environment', async () => {
    process.env.NODE_ENV = 'development'
    const options = await checkAndConfigureMailOptions()
    expect(options).toStrictEqual({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: expect.any(String), 
        pass: expect.any(String) 
      }
    })
  })
  test('should return the default configuration in a production environment without options given', async () => {
    process.env.NODE_ENV = 'production'
    const options = await checkAndConfigureMailOptions()
    expect(options).toStrictEqual({
      host: SMTP_DEFAULT_HOST,
      port : SMTP_DEFAULT_PORT,
      secure: SMTP_DEFAULT_SECURE,
      auth: {
        user: SMTP_DEFAULT_USER, 
        pass: SMTP_DEFAULT_PASS
      }
    })
  })
  test('should return default configuration if options given are incomplete', async () => {
    process.env.NODE_ENV = 'production'
    const options1 = await checkAndConfigureMailOptions({ mailoptions: { port: 587 }})
    expect(options1).toStrictEqual({
      host: SMTP_DEFAULT_HOST,
      port : SMTP_DEFAULT_PORT,
      secure: SMTP_DEFAULT_SECURE,
      auth: {
        user: SMTP_DEFAULT_USER, 
        pass: SMTP_DEFAULT_PASS
      }
    })
    const options2 = await checkAndConfigureMailOptions({ mailoptions: { host: "mailgun", port: 587, auth: "contact@myapp.com" }})
    expect(options1).toStrictEqual({
      host: SMTP_DEFAULT_HOST,
      port : SMTP_DEFAULT_PORT,
      secure: SMTP_DEFAULT_SECURE,
      auth: {
        user: SMTP_DEFAULT_USER, 
        pass: SMTP_DEFAULT_PASS
      }
    })
  })
})