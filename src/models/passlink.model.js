/**
 * Handle Mongoose tasks related to the Passlink collection
 *
 * @module PasslinkModel
 * @requires mongoose
 */
import mongoose from 'mongoose'
// import moment from 'moment'
// import debug from 'debug'
const ObjectId = mongoose.Schema.Types.ObjectId;

/**
 * @typedef { Object } PasslinkParameters
 * @property { String } key
 * @property { ObjectId } user
 * @property { Date } expiration
 */
/**
 * @constructor
 * @desc Create a model schema for passlinks with mongoose
 * @memberof PasslinkModel
 * @private
 */
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


/** 
 * The class for the Passlink model in mongoose
 * @constructor
 * @param { PasslinkParameters } parameters
 */
const Passlink = mongoose.model('passlink', passlinkSchema)

export default Passlink
