/** 
 * Configure mongoose-data-seed package
 * Terminal command to launch the seed : yarn md-seed run --dropdb
 * Terminal command to launch the seed whitout deleting the database (warning : could create double data) : yarn md-seed run
 * Terminal command to launch the seed (modelName could be 'users' or 'exemples' ...) only for a specific model: yarn md-seed run modelName
 * Warning : in each seed model, there is a control : seeding is allowed if there are no document of this model in the database (see seeders file shouldRun() )
 * Info : the seeder folder is configured in package.json : "mdSeed": { "seedersFolder": "./seeders"}
*/
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
