import { Seeder } from 'mongoose-data-seed'
import User from '../src/models/user.model'
import { hashPassword } from '../src/models/utils/passwordLib'
import { seed }  from './seed'

// import the part of the data to be seeded by this file according to the model name
const data = seed().users

/**
 * @class
 * @classdesc Create a seeder for Users model with methods shouldRun() and run()
 */
class UsersSeeder extends Seeder {

  /**
   * Control if the database is empty for this model to allow seeding
   * @return { Boolean } 
   */
  async shouldRun() {
    return User.countDocuments().exec().then(count => count === 0)
  }

  /**
   * Follow the steps to run the seed for this model
   * @return { Object } The different users that have been seeded in database
   */
  async run() {
    console.log('----- Creating users')
    let users = []
    for (var i = 0; i < data.length; i++) {
      let user = new User(data[i])
      users.push(await user.save())
    }
    console.log(users)
    return users
  }
}

export default UsersSeeder
