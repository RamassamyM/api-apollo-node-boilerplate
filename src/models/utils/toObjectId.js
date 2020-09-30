import mongoose from 'mongoose'
// ids can be one id or an array of id
// this function will transform it in objectIds

/**
 * Convert an id or an array of id in object ids
 * @param { String|String[]} ids
 * @return { *|*[] } ObjectId or array of ObjectIds to be used with mongoose
 */
export function toObjectId (ids) {
  if (ids.constructor === Array) {
      return ids.map(mongoose.Types.ObjectId);
  }
  return mongoose.Types.ObjectId(ids);
}
