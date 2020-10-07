/**
 * Implement the resolver for all queries or mutations with exemples in graphql
 * @module ExempleGraphqlResolvers
 * @requires graphql
 * @requires graphql-type-json
 * @requires lodash
 */
import { GraphQLScalarType } from 'graphql'
import GraphQLJSON from 'graphql-type-json'
import Exemple from '../../models/exemple.model'
import { toObjectId } from '../../models/utils/toObjectId'
// import mongoose from 'mongoose'
import _get from 'lodash/get'

// The userLocationOnContext is defined in the creation of GraphqlServer in graphqlserver.js
const userLocationInContext = 'req.currentUser'

/**
 * @const default
 * @property { Object } Query Handle the exemple graphql queries
 * @property { Object } User Handle the exemple graphql computed property
 * @property { Object } Mutation Handle the exemple graphql mutations
 * @property { Object } Date Handle the graphql type DATE
 * @property { Object } JSON Handle the graphql type JSON
 */
export default {
  Query: {
    /**
     * @function exemples
     * @desc Query that returns exemple instances informations
     * @return { Object[] } An array of exemples
     * @async
     */
    exemples: async (root, args, context) => Exemple.find({isDeleted: false}).populate('author'),
    /**
     * @function exemple
     * @desc Query that returns the exemple instance informations found with the provided id instance
     * @return { Object } An exemple
     * @async
     */
    exemple: async (root, args, context) => Exemple.findOne({ _id: args._id, isDeleted: false}).populate('author'),
    /**
     * @function myExemples
     * @desc Query that returns the exemples informations belonging to the current user instances
     * @return { Object[] } An array of exemples
     * @async
     */
    myExemples: async (root, args, context) => Exemple.find({ 'author' : _get(context, userLocationInContext) }).populate('author')
  },
  Mutation: {
    /**
     * @function createExemple
     * @desc Mutation that handles the creation of an exemple
     * @return { Object } The exemple
     * @throws error
     * @async
     */
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
    /**
     * @function editExemple
     * @desc Mutation that handles the edition of an exemple
     * @return { Object } The exemple
     * @throws error
     * @async
     */
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
    /**
     * @function deleteExemple
     * @desc Mutation that handles the deletion of an exemple
     * @return { Object } The deleted exemple
     * @throws error
     * @async
     */
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
      // Implement the Date graphql type
    Date: new GraphQLScalarType({
      name: 'Date',
      description: 'Date custom scalar type',
      parseValue: (value) => moment(value).toDate(),
      serialize: (value) => value.getTime(),
      parseLiteral: (ast) => ast,
    }),
    // Implement the JSON graphql type
    JSON: GraphQLJSON,
  },
}
