import { MAILER, TEST_EMAIL_HOST, TEST_EMAIL_PORT, SMTP_SECURE } from '../../configEmail'
import nodemailer from 'nodemailer'

describe('Email service configuration', () => {
  test('should return test configuration in test environment', async (done) => {
    expect.assertions(1)
    const testConfiguration = {
      host: TEST_EMAIL_HOST,
      port: TEST_EMAIL_PORT,
      secure: SMTP_SECURE, // true for 465, false for other ports
    }
    const sendingParameters = await MAILER() 
    expect(sendingParameters).toMatchObject({ 
      ...testConfiguration,
      auth: {
        user: expect.any(String),
        pass: expect.any(String)
      }
    })
    done()
  })
  test('should throw an error if nodemailer.createTestAccount() is not working', async (done) => {
    expect.assertions(2)
    const errorMessage = 'Error while creating account'
    const spy = await jest.spyOn(nodemailer, 'createTestAccount')
    spy.mockImplementation(() => {
      throw errorMessage
    })
    return MAILER().catch(e => {
      expect(spy).toHaveBeenCalled()
      expect(e).toMatch(errorMessage)
      spy.mockRestore()
      done()
    })
  })
})