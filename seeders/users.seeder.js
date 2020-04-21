import { Seeder } from 'mongoose-data-seed'
import User from '../src/models/user.model'
import { hashPassword } from '../src/models/utils/passwordLib'
import { seed }  from './seed'

const data = seed().users

class UsersSeeder extends Seeder {

  async shouldRun() {
    return User.countDocuments().exec().then(count => count === 0)
  }

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
