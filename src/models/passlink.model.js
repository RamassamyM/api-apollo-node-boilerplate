import mongoose from 'mongoose'
// import moment from 'moment'
// import debug from 'debug'
const ObjectId = mongoose.Schema.Types.ObjectId;

const passlinkSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true
  },
  user: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  expiration: {
    type: Date,
    required: true
  }
}, { timestamps: true })


const Passlink = mongoose.model('passlink', passlinkSchema)

export default Passlink
