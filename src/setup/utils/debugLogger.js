import { GRAPHQL_DEBUG } from '../../config'

/**
 * Display log from the request in console
 * @param { Object } req 
 */
export function logRequest (req) {
  if (GRAPHQL_DEBUG) {
    console.log('\n\n\n', req.method, ' ', req.url, ' - referer: ', req.headers.referer, ' - query name: ', req.body.operationName, ' - variables:')
    console.log(req.body.variables)
  }
}

/**
 * Display log from the response in console
 * @param { Object } res 
 */
export function logResponse (res) {
  if (GRAPHQL_DEBUG) {
    console.log('Response: ')
    console.log(res)
  }
}
