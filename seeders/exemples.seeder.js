/**
 * This is an exemple for the seeder, it has to be replaced by real data names and contents according to the data model
 */
require('dotenv').config()
import { Seeder } from 'mongoose-data-seed'
import User from '../src/models/user.model'
import Exemple from '../src/models/exemple.model'
import { seed }  from './seed'

const data = seed().exemples
const EMAIL = process.env.ADMIN_EMAIL

/**
 * @class
 * @classdesc Create a seeder for Exemples model with methods shouldRun() and run()
 */
class ExemplesSeeder extends Seeder {

  /**
   * Control if the database is empty for this model to allow seeding
   * @return { Boolean } 
   */
  async shouldRun() {
    return Exemple.countDocuments().exec().then(count => count === 0)
  }

  /**
   * Follow the steps to run the seed for this model
   * @return { Object } The different exemples that have been seeded in database
   */
  async run() {
    let users = await User.find({ email: EMAIL})
    let user = users[0]
    console.log('----- Creating exemples for the admin user')
    for (var i = 0; i < data.length; i++) {
      // Supposing that the user is author of the exemple
      data[i].author = user._id
    }
    console.log(data)
    return Exemple.create(data);
  }
}

export default ExemplesSeeder
