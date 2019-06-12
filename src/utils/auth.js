import Cookies from 'js-cookie'
import { JSEncrypt } from 'jsencrypt'

const TokenKey = 'Admin-Token'

const publicKey =
  'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCyW0HPw0f3PJld8p6gsc5YjV1Z/3fnWnOJmgQxQZMj1TwlyrOaRMrrTh0Nu99RzV6hkvMmVMRca80kX7TnMHNylJtrt+uYodEbW8HHyfhNC1fLVQN38hPbClgeMfcxxTs0FvoOyYE7R5J/k0gHeTElQmcpTkaJPTqVxSgL9nNnywIDAQAB'

/**
 * jsencrypt 公钥加密
 */
export function encrypt(obj) {
  const encrypt = new JSEncrypt()
  encrypt.setPublicKey(publicKey)
  const objCopy = { ...obj }
  for (const key in objCopy) {
    objCopy[key] = encrypt.encrypt(objCopy[key])
  }
  return objCopy
}

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
