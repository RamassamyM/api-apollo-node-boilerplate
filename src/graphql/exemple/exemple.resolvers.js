import Exemple from '../../models/exemple.model'
import { toObjectId } from '../../models/utils/toObjectId'
// import mongoose from 'mongoose'
import _get from 'lodash/get'

// The userLocationOnContext is defined in the creation of GraphqlServer in graphqlserver.js
const userLocationInContext = 'req.currentUser'


export default {
  Query: {
    exemples: async (root, args, context) => Exemple.find({isDeleted: false}).populate('author'),
    exemple: async (root, args, context) => Exemple.findOne({ _id: args._id, isDeleted: false}).populate('author'),
    myExemples: async (root, args, context) => Exemple.find({ 'author' : _get(context, userLocationInContext) }).populate('author')
  },
  Mutation: {
    createExemple: async (root, args, context) => {
      try {
        const currentUser = _get(context, userLocationInContext)
        args.author = currentUser
        const exemple = Exemple.create(args)
        return exemple
      } catch (e) {
        throw new Error('Could not create a exemple')
      }
    },
    editExemple: async (root, args, context) => {
      try {
        const options = { new: true, runValidators: true }
        const query = { _id: args._id }
        await delete args.__id
        let exemple = await Exemple.findOne(query).populate('author')
        const currentUser = await _get(context, userLocationInContext)
        if (exemple.author._id.toString() !== currentUser._id.toString()) {
          throw new Error('You are not allowed to edit this exemple.')
        }
        if (exemple.isDeleted) throw new Error('This exemple has been deleted')
        Exemple.assign(exemple, args)
        return exemple.save()
      } catch (e) {
        throw new Error('Could not edit the exemple')
      }
    },
    deleteExemple: async function (root, args, context) {
      try {
        const query = { _id: args._id }
        const exemple = await Exemple.findOne(query).populate('author')
        const currentUser = await _get(context, userLocationInContext)
        if (exemple.author._id.toString() !== currentUser._id.toString()) {
          throw new Error('You are not allowed to delete this exemple.')
        }
        if (exemple.isDeleted) throw new Error('This exemple has already been deleted')
        exemple.isDeleted = true
        return exemple.save()
      } catch (e) {
        throw new Error('Could not delete the exemple')
      }
    },
  },
}
