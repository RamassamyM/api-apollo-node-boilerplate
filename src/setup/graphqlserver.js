/**
 * @todo Implement graphQL with apollo and remove graphql-yoga to limit packages dependencies and use a stronger community in the future
 */
import { GraphQLServer } from 'graphql-yoga'
import schema from '../graphql/schema'
import morgan from 'morgan'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import getCurrentUserfromJwtToken from './utils/getJwtTokenAndCurrentUser'
import { logRequest, logResponse } from './utils/debugLogger'
import NoIntrospection from 'graphql-disable-introspection'
// If a Node.js compression middleware is needed to compress bodies response, 
// uncomment the line below and see compression package documentation to implement it
// import compression from 'compression'
import cors from 'cors'
import {
  PORT,
  SUBSCRIPTION_ENDPOINT,
  CLIENT_ORIGIN,
  JWT_SECRET,
  // Now a jwt token is used not a cookie for authentication
  // COOKIE_DOMAIN,
  // COOKIE_NAME,
  PUBLIC_URL,
  GRAPHQL_ENDPOINT,
  PLAYGROUND_ENDPOINT,
  GRAPHQL_DEBUG,
  ENV,
} from '../config'

/**
 * @function setupGraphqlServer Launch GraphQL API server
 */
export default function () {
  console.log(`Starting server graphql in mode ${ENV}`)
  console.log(`Client-origin authorization for CORS: ${CLIENT_ORIGIN}`)
  const rules = ENV === 'production' ? [NoIntrospection] : []
  const serverOptions = {
    port: PORT,
    endpoint: GRAPHQL_ENDPOINT,
    subscriptions: SUBSCRIPTION_ENDPOINT,
    playground: PLAYGROUND_ENDPOINT,
    debug: GRAPHQL_DEBUG || false,
    tracing: GRAPHQL_DEBUG || false,
    validationRules: rules,
    // https: {
    //   cert: CERT,
    //   key: KEY,
    // },
    // Uncomment the lines below to have more error infos in terminal for debugging
    // formatError: error => {
    //   console.log(error)
    //   return error
    // },
    cors: false, // apollo cors work properly with same origin client so needed to deactivate it and use cors with express directly
    formatResponse: res => {
      logResponse(res)
      return res
    },
  }
  const server = new GraphQLServer({
    // introspection: false,
    schema,
    playground: {
      settings: {
        'editor.theme': 'light',
      },
      tabs: [
        // {
        //   endpoint,
        //   query: defaultQuery,
        // },
      ],
    },
    context: async ({ request, response }) => {
      const req = request
      const res = response
      logRequest(req)
      const { currentUser } = await getCurrentUserfromJwtToken(req)
      return { 'req': Object.assign({}, req, { currentUser }), res }
    },
  })

  const corsOptions = {
    credentials: true,
    origin: CLIENT_ORIGIN,
  }
  server.express.use(cors(corsOptions))

  server.express.use(helmet())
  server.express.use(morgan('dev'))
  server.express.use(cookieParser(JWT_SECRET))
  server.start(serverOptions, ({ port }) => {
    console.log(`🚀 API Server is running on port ${port} at ${PUBLIC_URL}${GRAPHQL_ENDPOINT}`)
    console.log(`API Subscriptions server is now running on ${SUBSCRIPTION_ENDPOINT}`)
  })
}
