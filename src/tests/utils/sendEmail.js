// test method sendForgotPasswordEmail
// which can have optional arguments { sender, receiver, passlinkUrl }
// We are not testing nodemailer but testing that the good infos are given to nodemailer first :
// sent to the good receiver
// with the good sender
// and contains the link for changing password
// we want to test cases where all infos are not given

// thn we want to test that an email is sent with a smtp request
// we want to test that the email was received


// You can build or parse a message body without sending it anywhere. You can test sending messages without sending a legitimate message.
// Then you only need end to end tests to make sure at least one message gets to its destination. For that, the last time I did this I set up our build slaves so they used local mail delivery, and I disabled all upstream communication so that a malfunction wouldn't send anything to a real human.
// Before the test I emptied the mailbox and then used a little bash script to count the messages in the mailbox after the test. And the QA team had a couple of manual tests they did just to be sure.


// var nodemailer = require('nodemailer');
// var stubTransport = require('nodemailer-stub-transport');

// var transport;

// if (/* are you testing */) {
//     transport = nodemailer.createTransport(stubTransport());
// }
// else {
//     transport = nodemailer.createTransport(/* your normal config */);
// }

// module.exports = transport;

import nodemailer from 'nodemailer'
import { sendForgotPasswordEmail } from '../../utils/sendEmail'
import { MAILER } from '../../configEmail'

// jest.mock('nodemailer')

describe('Send a forgotten password Email', () => {
  describe('Prepare email with good infos and sending options', () => {
    afterEach(() =>  {
      if (MAILER.options.send) {
        delete MAILER.options.send
      }
    })
    test('should generate an email with good informations about the sender, the receiver and the passlinkUrl', done => {
      const sender = { name: 'testName' , email: 'test@email.com'}
      const receiver = { username: 'Michael', email: 'sunsmiley@live.fr'}
      const passlinkUrl = 'http://www.myapp/com/newpassword/1234'
      MAILER.options.send = async function(data, callback) {
        try {
          expect(data.data.from).toBe(`"${sender.name}" <${sender.email}>`)
          expect(data.data.html).toContain(receiver.username)
          expect(data.data.html).toContain(passlinkUrl)
          expect(data.data.text).toContain(receiver.username)
          expect(data.data.text).toContain(passlinkUrl)
          expect(data.data.to).toBe(receiver)
          done()
        } catch (error) {
          done(error)
        }
        callback()
      }
      sendForgotPasswordEmail({ sender, receiver, passlinkUrl })
      done()
    })
    test('should generate an email with good informations with default sender if sender is not given', done => {
      const defaultSender = { name: MAILER.from.defaultSenderName, email: MAILER.from.defaultSenderEmail }
      const receiver = { username: 'Michael', email: 'sunsmiley@live.fr'}
      const passlinkUrl = 'http://www.myapp/com/newpassword/1234'
      MAILER.options.send = async function(data, callback) {
        try {
          expect(data.data.from).toBe(`"${defaultSender.name}" <${defaultSender.email}>`)
          expect(data.data.html).toContain(receiver.username)
          expect(data.data.html).toContain(passlinkUrl)
          expect(data.data.text).toContain(receiver.username)
          expect(data.data.text).toContain(passlinkUrl)
          expect(data.data.to).toBe(receiver)
          done()
        } catch (error) {
          done(error)
        }
        callback()
      }
      sendForgotPasswordEmail({ receiver, passlinkUrl })
      done()
    })
    test('should throw an error if receiver is not given', async () => {
      MAILER.options.send = async function(data, callback) {
        callback()
      }
      const passlinkUrl = 'http://www.myapp/com/newpassword/1234'
      expect.assertions(1)
      try {
        await sendForgotPasswordEmail({ passlinkUrl })
      } catch (e) {
        expect(e.message).toMatch('Receiver or passLinkUrl not given or malformed')
      }
    })
    test('should throw an error if passlinkUrl is not given', async () => {
      MAILER.options.send = async function(data, callback) {
        callback()
      }
      const receiver = { username: 'Michael', email: 'sunsmiley@live.fr'}
      expect.assertions(1)
      try {
        await sendForgotPasswordEmail({ receiver })
      } catch (e) {
        expect(e.message).toMatch('Receiver or passLinkUrl not given or malformed')
      }
    })
    test('should throw an error if passlinkUrl and receiver are not given', async () => {
      MAILER.options.send = async function(data, callback) {
        callback()
      }
      expect.assertions(1)
      try {
        await sendForgotPasswordEmail()
      } catch (e) {
        expect(e.message).toMatch('Receiver or passLinkUrl not given or malformed')
      }
    })
  })
  describe('send email in test account', () => {
    test('should send an email to etheral', async () => {
      const sender = { name: 'testName' , email: 'test@email.com'}
      const receiver = { username: 'Michael', email: 'sunsmiley@live.fr'}
      const passlinkUrl = 'http://www.myapp/com/newpassword/1234'
      const data = await sendForgotPasswordEmail({ sender, receiver, passlinkUrl })
      expect(data).toBe(true)
    })
  })
  // test('should call nodemailer with good emailing options', done => {
  //   const messageInfo = { messageId: "good test messageId"}
  //   const options = {
  //     host: "smtp.ethereal.email",
  //     port: 587,
  //     secure: false,
  //     auth: { user: 'testUser', pass: 'testPass'}
  //   }
    
  //   sendForgotPasswordEmail({ sender, receiver, passlinkUrl })
  // })
})
