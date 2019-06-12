import request from '@/utils/request'
import qs from 'querystring'
export function getUserInfo(token) {
  return request({
    url: 'api/User/getUserInfoByToken',
    method: 'get',
    params: { token }
  })
}

export function getListPagedUser(params) {
  return request.get('api/User/GetListPaged', params)
}

export function updateUser(user) {
  return request.post('api/User/Post', qs.stringify(user))
}

export function createUser(user) {
  return request.put('api/User/Put', user)
}

export function removeUser(userId) {
  return request.delete('api/User/Delete', userId)
}

export function changeUserInfo(userId, name, roles) {
  return request.post('api/User/ChangeUserInfo', {
    id: userId,
    name: name,
    roles: roles
  })
}

export function changeUserPassword(userId, newPassword) {
  return request.post(
    'api/User/changepassword',
    qs.stringify({
      id: userId,
      password: newPassword
    })
  )
}

export function changeUserStatus(userId, newStatus) {
  console.log(userId, status)
  return request.post(
    'api/User/changestatus',
    qs.stringify({
      id: userId,
      status: newStatus
    })
  )
}
