require('dotenv').config()
import { Seeder } from 'mongoose-data-seed'
import User from '../src/models/user.model'
import Exemple from '../src/models/exemple.model'
import { seed }  from './seed'

const data = seed().tournaments
const EMAIL = process.env.ADMIN_EMAIL

class ExemplesSeeder extends Seeder {

  async shouldRun() {
    return Exemple.countDocuments().exec().then(count => count === 0)
  }

  async run() {
    let users = await User.find({ email: EMAIL})
    let user = users[0]
    console.log('----- Creating exemples')
    for (var i = 0; i < data.length; i++) {
      data[i].author = user._id
    }
    console.log(data)
    return Exemple.create(data);
  }
}

export default ExemplesSeeder
