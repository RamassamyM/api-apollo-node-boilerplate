import fs from 'fs'
require('dotenv').config()
const crypto = require('crypto')

// Explicit
export const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/myapp'

// Have Defaults
export const PORT = process.env.PORT || 5000
export const JWT_SECRET = process.env.JWT_SECRET
export const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:8080'
export const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:3000'
export const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined
export const COOKIE_NAME = process.env.COOKIE_NAME || 'api-graphql-cookie'
export const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || '/graphql'
export const SUBSCRIPTION_ENDPOINT = process.env.SUBSCRIPTION_ENDPOINT || '/subscriptions'
export const PLAYGROUND_ENDPOINT = process.env.PLAYGROUND_ENDPOINT || '/playground'
export const DB_NAME = process.env.DB_NAME || 'myapp'
// Set these debug options to true to console log all graphql queries infos and mongoose database queries
export const DB_DEBUG = process.env.DB_DEBUG ? process.env.DB_DEBUG === 'true' : false
export const GRAPHQL_DEBUG = process.env.GRAPHQL_DEBUG ? process.env.GRAPHQL_DEBUG === 'true' : process.env.NODE_ENV === 'development'
export const ENV = process.env.NODE_ENV || process.env.ENV || 'production'
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
export const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID
export const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET
export const CRYPTOPASSWORD = process.env.CRYPTOPASSWORD
export const JWT_PRIVATEKEY = fs.readFileSync(`${__dirname}/../${process.env.PATH_TO_PRIVATEKEY}`, 'utf8')
export const JWT_PUBLICKEY = fs.readFileSync(`${__dirname}/../${process.env.PATH_TO_PUBLICKEY}`, 'utf8')
export const JWT_TOKEN_DURATION = process.env.TOKEN_DURATION || '900' // in sec
export const REFRESHTOKEN_PRIVATEKEY = fs.readFileSync(`${__dirname}/../${process.env.PATH_TO_REFRESHTOKEN_PRIVATEKEY}`, 'utf8')
export const REFRESHTOKEN_PUBLICKEY = fs.readFileSync(`${__dirname}/../${process.env.PATH_TO_REFRESHTOKEN_PUBLICKEY}`, 'utf8')
export const REFRESHTOKEN_DURATION = process.env.REFRESHTOKEN_DURATION || '1209600' // in sec (1209600 SEC)
export const LDAP_URL = process.env.LDAP_URL
export const HTTPS_SET = process.env.HTTPS_SET || process.env.NODE_ENV === 'production'
export const LDAP_BASE = process.env.LDAP_BASE
export const LDAP_SEARCH_FILTER = process.env.LDAP_SEARCH_FILTER
export const PATH_TO_TLS_LDAP_PUBLIC_KEY = process.env.PATH_TO_TLS_LDAP_PUBLIC_KEY
export const EMAIL_HOST = process.env.EMAIL_HOST
export const EMAIL_PORT = process.env.EMAIL_PORT
export const EMAIL_USER = process.env.EMAIL_USER
export const EMAIL_PASS = process.env.EMAIL_PASS
