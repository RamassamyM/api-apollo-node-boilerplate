/**
 * @files This file is the starting point of the application, it will do the setup in order
 */
import setupDatabase from './setup/database'
// To use passport authentification solutions uncomment the lines below referred to passport after making sure passport is well configured and implemented
// import setupPassport from './setup/auth/passport'
import setupGraphqlServer from './setup/graphqlserver'
import path from 'path'

async function main () {
  await setupDatabase()
  // await setupPassport()
  await setupGraphqlServer()
}

main()
