import { generateJWTToken, generateRefreshToken, verifyJWT, verifyRefreshToken } from '../../../utils/generateAndVerifyToken'
import _ from 'lodash'

describe('Generate a jwt token', () => {
  test('should return an object with jwt and jwtExpiration when a object containing an email is given', async () => {
    const data = { email: 'me@email.com' }
    const token = await generateJWTToken(data)
    expect(typeof(token)).toBe('object')
    expect(token.jwt).toBeTruthy()
    expect(token.jwtExpiration).toBeTruthy()
  })
  test('should throw an error if an empty object is given', async () => {
    const data = { }
    const token = generateJWTToken(data)
    expect(token).rejects.toBe("Empty data given to generate token")
  })
})

describe('Generate a refresh token', () => {
  test('should return an object with refreshToken and refreshTokenExpiration when a object containing an email is given', async () => {
    const data = { email: 'me@email.com' }
    const token = await generateRefreshToken(data)
    expect(typeof(token)).toBe('object')
    expect(token.refreshToken).toBeTruthy()
    expect(token.refreshTokenExpiration).toBeTruthy()
  })
  test('should throw an error if an empty object is given', async () => {
    const data = { }
    const token = generateRefreshToken(data)
    expect(token).rejects.toBe("Empty data given to generate token")
  })
})

describe('Verify a JWT token', () => {
  test('should return valid clear token if JWT token is valid', async () => {
    const data = { email: 'me@email.com' } 
    const jwtPayload = await generateJWTToken(data)
    const clearToken = await verifyJWT(jwtPayload.jwt)
    expect(typeof(clearToken)).toBe('object')
    expect(clearToken.clearToken).toBeTruthy()
    expect(clearToken.clearToken.data).toBeTruthy()
    expect(clearToken.clearToken.exp).toBeTruthy()
    expect(clearToken.clearToken.iat).toBeTruthy()
    expect(typeof(clearToken.clearToken.data)).toBe('object')
    expect(clearToken.clearToken.data).toStrictEqual({ email: 'me@email.com' })
  })
  test('should throw an error it JWT token signature is not valid', async () => {
    const jwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1ODkwNDczMzMsImRhdGEiOnsiZW1haWwiOiJtZUBlbWFpbC5jb20ifSwiaWF0IjoxNTg5MDQ3MjczfQ.WAQdk6brnSpKC0RJdTDOSJQCaBbX9Kr-5jHssmJ0eul3heRlmRNdbZsD9HR9C4Pr1y0L9oMdvBeqi6h3Lz-XMG-BPRZd4JXMpHWX65eRuYvjV6MSxsDBHAh5h8_s7KPGyw0u_stn_XWN75_0szqiVNaUEaWV8xAmpOHYzYHVAgE_CTpV1U0EhyD40mrBGpuNznpV25rkDlBEOod_FAMNhLRDCpM_xoyjd6WAFvqhjai-2EJ5ZM-QNsLpvyUCtQ_RC84XOznJQwPgzSG0VbH7vOMl4TpeuHtXLVhe44eAaNU7imbOawnm94Kc1z_tNYj4sXv-fVI-4ndCUGNNjRuJg1TdQWXx21M1M1p0S3oWHxgCBSKBsVp8KbzwFp6rydKwmk4-6oHSC3aybh9W9z3XJ5JHXWzijlLV7Br66oZIXEXTKlqUCcPVWHh5TlRldSLWqO-gUyN3zeHRFLWqZooPQDQBqcNpkfT0S_7t3vfAhT80eChZAkvv1nJKlAFC3dbRZxgbtGJLfpsuFZWC--R-IzTAC39mnzRyuBnscotD3qFJYZY1oLPQnsoqJYIZ9NR7aUsrKBXrvGAQvf43dThl1J_0ynHBq6wd4EZmDkvWT8jmU33gGd1brg2SYBl2MFFjI0bw0cRhS-G9k-yL7YoSyoqdusm5nWCwnqc0xqhGsr'
    const verify = async () => verifyJWT(jwt)
    return expect(verify()).rejects.toThrow("invalid signature")
  })
  test('should throw an error it JWT token is malformed', async () => {
    const jwt = 'malformedJWT1234'
    const verify = async () => verifyJWT(jwt)
    return expect(verify()).rejects.toThrow("jwt malformed")
  })
  test('should return expired if JWT token is expired', async () => {
    const jwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1ODkwNDczMzMsImRhdGEiOnsiZW1haWwiOiJtZUBlbWFpbC5jb20ifSwiaWF0IjoxNTg5MDQ3MjczfQ.WAQdk6brnSpKC0RJdTDOSJQCaBbX9Kr-5jHssmJ0eul3heRlmRNdbZsD9HR9C4Pr1y0L9oMdvBeqi6h3Lz-XMG-BPRZd4JXMpHWX65eRuYvjV6MSxsDBHAh5h8_s7KPGyw0u_stn_XWN75_0szqiVNaUEaWV8xAmpOHYzYHVAgE_CTpV1U0EhyD40mrBGpuNznpV25rkDlBEOod_FAMNhLRDCpM_xoyjd6WAFvqhjai-2EJ5ZM-QNsLpvyUCtQ_RC84XOznJQwPgzSG0VbH7vOMl4TpeuHtXLVhe44eAaNU7imbOawnm94Kc1z_tNYj4sXv-fVI-4ndCUGNNjRuJg1TdQWXx21M1M1p0S3oWHxgCBSKBsVp8KbzwFp6rydKwmk4-6oHSC3aybh9W9z3XJ5JHXWzijlLV7Br66oZIXEXTKlqUCcPVWHh5TlRldSLWqO-gUyN3zeHRFLWqZooPQDQBqcNpkfT0S_7t3vfAhT80eChZAkvv1nJKlAFC3dbRZxgbtGJLfpsuFZWC--R-IzTAC39mnzRyuBnscotD3qFJYZY1oLPQnsoqJYIZ9NR7aUsrKBXrvGAQvf43dThl1J_0ynHBq6wd4EZmDkvWT8jmU33gGd1brg2SYBl2MFFjI0bw0cRhS-G9k-yL7YoSyoqdusm5nWCwnqc0xqhGsrU'
    const verify = async () => verifyJWT(jwt)
    return expect(verify()).rejects.toThrow("jwt expired")
  })
})

describe('Verify a Refresh token', () => {
  test('should return valid clear token if Refresh token is valid', async () => {
    const data = { email: 'me@email.com' } 
    const refreshTokenPayload = await generateRefreshToken(data)
    const clearToken = await verifyRefreshToken(refreshTokenPayload.refreshToken)
    expect(typeof(clearToken)).toBe('object')
    expect(clearToken.clearToken).toBeTruthy()
    expect(clearToken.clearToken.data).toBeTruthy()
    expect(clearToken.clearToken.exp).toBeTruthy()
    expect(clearToken.clearToken.iat).toBeTruthy()
    expect(typeof(clearToken.clearToken.data)).toBe('object')
    expect(clearToken.clearToken.data).toStrictEqual({ email: 'me@email.com' })
  })
  test('should throw an error it Refresh token signature is not valid', async () => {
    const refreshToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1ODkwNDczMzMsImRhdGEiOnsiZW1haWwiOiJtZUBlbWFpbC5jb20ifSwiaWF0IjoxNTg5MDQ3MjczfQ.WAQdk6brnSpKC0RJdTDOSJQCaBbX9Kr-5jHssmJ0eul3heRlmRNdbZsD9HR9C4Pr1y0L9oMdvBeqi6h3Lz-XMG-BPRZd4JXMpHWX65eRuYvjV6MSxsDBHAh5h8_s7KPGyw0u_stn_XWN75_0szqiVNaUEaWV8xAmpOHYzYHVAgE_CTpV1U0EhyD40mrBGpuNznpV25rkDlBEOod_FAMNhLRDCpM_xoyjd6WAFvqhjai-2EJ5ZM-QNsLpvyUCtQ_RC84XOznJQwPgzSG0VbH7vOMl4TpeuHtXLVhe44eAaNU7imbOawnm94Kc1z_tNYj4sXv-fVI-4ndCUGNNjRuJg1TdQWXx21M1M1p0S3oWHxgCBSKBsVp8KbzwFp6rydKwmk4-6oHSC3aybh9W9z3XJ5JHXWzijlLV7Br66oZIXEXTKlqUCcPVWHh5TlRldSLWqO-gUyN3zeHRFLWqZooPQDQBqcNpkfT0S_7t3vfAhT80eChZAkvv1nJKlAFC3dbRZxgbtGJLfpsuFZWC--R-IzTAC39mnzRyuBnscotD3qFJYZY1oLPQnsoqJYIZ9NR7aUsrKBXrvGAQvf43dThl1J_0ynHBq6wd4EZmDkvWT8jmU33gGd1brg2SYBl2MFFjI0bw0cRhS-G9k-yL7YoSyoqdusm5nWCwnqc0xqhGsrU'
    const verify = async () => verifyRefreshToken(refreshToken)
    return expect(verify()).rejects.toThrow("invalid signature")
  })
  test('should throw an error it Refresh token is malformed', async () => {
    const refreshToken = 'malformedJWT1234'
    const verify = async () => verifyRefreshToken(refreshToken)
    return expect(verify()).rejects.toThrow("jwt malformed")
  })
  test('should return expired if Refresh token is expired', async () => {
    const refreshToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1ODkwNDk1MTgsImRhdGEiOnsiZW1haWwiOiJtZUBlbWFpbC5jb20ifSwiaWF0IjoxNTg5MDQ5NDU4fQ.JErcyV_5iA_E7M9tVz2gbuV80Al0y9x-A-agzmwUKM1oBGflSNLItlYl-GjqWZT5Wfy6RBPCqAzu4-tNQ57YkaR6Q0UR-NRV0IFXc6fy6hZ-L7L687Y2mw0T0Ij8ATzafIeiLYVfBoOaKsJZO0ECYChmS4bWyLAqt4jU44tWansGmP7k43kPv-612NYaLnLgOP1_JoNSrAqO6UuLeoGYoXwdmD8czsggqWbNtbfLKMHpvB-h1zypnrWx5eDUt8WGHq5lkAkZJoNm3ZOPT-nG4qUlKW-M3TkoSUCVq7bWU_n059jjGgH1jZB894XsFGdmeTCVPEmI_XyXb3eRA1wKG0yEDhBfn20ASJyyYmaZO4ZsZhCZ4kAZ82BhI6tf6YOfgaG90wbvte4Oz6NoKDrbWfRdTlLdzqdSdLH3c2KUugvmqLcBSj0knj1ZYLzBSSmAebXjRKTtEJbe4wJiGVLtMsl7swkd3LWivC3sROiTnLE_LhNNnJqCd31tPHFoEVaxi2gAADYRTiKHu8AsJYIYjQrh1A54rs9V8XMhb_bjQb1BSOihJMJS_fEskU-5Ur7c8IIqafCQZgXegCUrKizTO5fNRYySsWbbFM2tWatonl9zkQLO8VQPvs3Xke_bazPckmaVqPQb5gCNwGqAXTe-Q9z3_7D-dZVTS-dv6cVRWOM'
    const verify = async () => verifyRefreshToken(refreshToken)
    return expect(verify()).rejects.toThrow("jwt expired")
  })
})
