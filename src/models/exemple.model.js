/**
 * Handle Mongoose tasks related to the Exemple collection
 *
 * @module ExempleModel
 * @requires mongoose
 */
import mongoose from 'mongoose'
// import moment from 'moment'
// import debug from 'debug'
const ObjectId = mongoose.Schema.Types.ObjectId;

/**
 * @typedef { Object } ExempleParameters
 * @property { String } title
 * @property { String[] } [keywords]
 * @property { String } [description]
 * @property { ObjectId } author as user
 * @property { Boolean } [isDeleted]
 */
/**
 * @constructor
 * @desc Create a model schema for Exemple with mongoose
 * @memberof ExempleModel
 * @private
 */
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

/** 
 * The class for the Exemple model in mongoose
 * @constructor
 * @param { ExempleParameters } parameters
 */
const Exemple = mongoose.model('exemple', exempleSchema)

export default Exemple
