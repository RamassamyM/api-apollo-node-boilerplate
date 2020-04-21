import mongoose from 'mongoose'
// ids can be one id or an array of id
// this function will transform it in objectIds

export function toObjectId (ids) {
  if (ids.constructor === Array) {
      return ids.map(mongoose.Types.ObjectId);
  }
  return mongoose.Types.ObjectId(ids);
}
