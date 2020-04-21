import mongoose from 'mongoose'
import Users from './seeders/users.seeder'
import Exemples from './seeders/exemples.seeder'
import { MONGO_URI } from './src/config'

const mongo_url = MONGO_URI
/**
 * Seeders List
 * order is important
 * @type {Object}
 */
export const seedersList = {
   Users,
   Exemples,
}
/**
 * Connect to mongodb implementation
 * @return {Promise}
 */
export const connect = async () =>
  // await mongoose.connect(mongoURL, { useNewUrlParser: true });
  await mongoose.connect(
    mongo_url,
    {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
/**
 * Drop/Clear the database implementation
 * @return {Promise}
 */
export const dropdb = async () => mongoose.connection.db.dropDatabase()
