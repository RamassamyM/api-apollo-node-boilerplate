// command to seed : yarn md-seed run --dropdb
// to add new seed without erasing previous data and reseeding same data user: yarn md-seed run exemples

require('dotenv').config()

import bcryptjs from 'bcryptjs'
// import { hashPassword } from '../src/models/utils/passwordLib'

const EMAIL = process.env.ADMIN_EMAIL
const PASSWORD = process.env.ADMIN_PASSWORD
const USERNAME = process.env.ADMIN_USERNAME

export function seed() {
  // let hashedPassword = await hashPassword("xxxx")
  // console.log('hashedPassword')
  // console.log(hashedPassword)
  const data = {
    "users": [
      {
        email: EMAIL,
        password: PASSWORD,
        username: USERNAME,
        roleAdmin: true
      },
    ],
    "exemples": [
      {}
    ]
  }
  return data
}
