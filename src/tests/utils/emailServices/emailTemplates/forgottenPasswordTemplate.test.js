import { generateForgottenPasswordContent } from '../../../../utils/emailServices/emailTemplates/forgottenPasswordTemplate'
import { DEFAULT_EMAIL_SENDER_EMAIL, DEFAULT_EMAIL_SENDER_NAME } from '../../../../config'

describe('Forgotten password email content generator', () => {
  test('should fail if username of receiver is not given', () => {
    const mailInfos = {
      sender: { name: "MyAppTeam", email: "contact@myapp.com" },
      receiver: { email: "sunsmiley@live.fr" },
      passlinkUrl: "http://myapp/newPassword/1234"
    }
    const mailContent = generateForgottenPasswordContent(mailInfos)
    expect(mailContent).toBe(false)
  })
  test('should fail if email of receiver is not given', () => {
    const mailInfos = {
      sender: { name: "MyAppTeam", email: "contact@myapp.com" },
      receiver: { username: "sunsmiley" },
      passlinkUrl: "http://myapp/newPassword/1234"
    }
    const mailContent = generateForgottenPasswordContent(mailInfos)
    expect(mailContent).toBe(false)
  })
  test('should fail if receiver is not given', () => {
    const mailInfos = {
      sender: { name: "MyAppTeam", email: "contact@myapp.com" },
      passlinkUrl: "http://myapp/newPassword/1234"
    }
    const mailContent = generateForgottenPasswordContent(mailInfos)
    expect(mailContent).toBe(false)
  })
  test('should fail if passlinkUrl is not given', () => {
    const mailInfos = {
      sender: { name: "MyAppTeam", email: "contact@myapp.com" },
      receiver: { username: "sunsmiley", email: "sunsmiley@live.fr" },
    }
    const mailContent = generateForgottenPasswordContent(mailInfos)
    expect(mailContent).toBe(false)
  })
  test('should use default sender name and email if sender is not given', () => {
    const mailInfos = {
      receiver: { username: "sunsmiley", email: "sunsmiley@live.fr" },
      passlinkUrl: "http://myapp/newPassword/1234"
    }
    const mailContent = generateForgottenPasswordContent(mailInfos)
    const defaultSender = `"${DEFAULT_EMAIL_SENDER_NAME}" <${DEFAULT_EMAIL_SENDER_EMAIL}>`
    expect(mailContent.from).toBe(defaultSender)
  })
  test('should use default sender name and email if sender email is not given', () => {
    const mailInfos = {
      sender: { name: "John" },
      receiver: { username: "sunsmiley", email: "sunsmiley@live.fr" },
      passlinkUrl: "http://myapp/newPassword/1234"
    }
    const mailContent = generateForgottenPasswordContent(mailInfos)
    const defaultSender = `"${DEFAULT_EMAIL_SENDER_NAME}" <${DEFAULT_EMAIL_SENDER_EMAIL}>`
    expect(mailContent.from).toBe(defaultSender)
  })
  test('should return an object with keys from, to, text, html, subject', () => {
    const mailInfos = {
      sender: { name: "John", email: "contact@app.com" },
      receiver: { username: "sunsmiley", email: "sunsmiley@live.fr" },
      passlinkUrl: "http://myapp/newPassword/1234"
    }
    const mailContent = generateForgottenPasswordContent(mailInfos)
    expect(mailContent).toMatchObject(expect.objectContaining({
      to: expect.anything(),
      from: expect.anything(),
      subject: expect.anything(),
      text: expect.anything(),
      html: expect.anything()
    }))
  })
  test('should contain the passlinkUrl in the text and html content of the object returned', () => {
    const mailInfos = {
      sender: { name: "John", email: "contact@app.com" },
      receiver: { username: "sunsmiley", email: "sunsmiley@live.fr" },
      passlinkUrl: "http://myapp/newPassword/1234"
    }
    const mailContent = generateForgottenPasswordContent(mailInfos)
    expect(mailContent.text).toStrictEqual(expect.stringContaining(mailInfos.passlinkUrl))
    expect(mailContent.html).toStrictEqual(expect.stringContaining(mailInfos.passlinkUrl))
  })
})