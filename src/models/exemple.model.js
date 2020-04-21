import mongoose from 'mongoose'
// import moment from 'moment'
// import debug from 'debug'
const ObjectId = mongoose.Schema.Types.ObjectId;

const exempleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  keywords: [{
    type: String,
  }],
  description: {
    type: String
  },
  author: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })


const Exemple = mongoose.model('exemple', exempleSchema)

export default Exemple
