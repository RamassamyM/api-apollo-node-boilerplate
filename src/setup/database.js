import mongoose from 'mongoose'
import { MONGO_URI, DB_DEBUG } from '../config'

/**
 * @function setupDatabase Configure and connect mongoose to MongoDB and log in the console the connexion or an error
 * To have more infos whil debugging, set DB_DEBUG to true in config.js
 */
export default function () {
  mongoose.set('debug', DB_DEBUG)
  mongoose.set('useFindAndModify', false)
  mongoose
    .connect(
      MONGO_URI,
      {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    )
    .then(() => console.log('MongoDB connected :' + MONGO_URI))
    .catch(err => console.log(err))
}
