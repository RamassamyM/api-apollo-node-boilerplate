/** 
 * Generate the data to be seeded
 * Terminal command to launch the seed : yarn md-seed run --dropdb
 * Terminal command to launch the seed whitout deleting the database (warning : could create double data) : yarn md-seed run
 * Terminal command to add new seed (modelName could be 'users' or 'exemples' ...) without erasing previous data and reseeding same data user: yarn md-seed run modelName
*/

require('dotenv').config()
const EMAIL = process.env.ADMIN_EMAIL
const PASSWORD = process.env.ADMIN_PASSWORD
const USERNAME = process.env.ADMIN_USERNAME

/**
 * Generate the data to be seeded
 * @returns { Object } Data to be seeded as an object containing the model names to seed as arrays of objects
 * @returns { Object[] } data.users
 * @returns { String } data.users[].email
 * @returns { String } data.users[].password
 * @returns { String } data.users[].username
 * @returns { Boolean } data.users[].roleAdmin
 * @returns { Object[] } data.exemples
 */
export function seed() {
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
