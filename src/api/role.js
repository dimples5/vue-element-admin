import request from '@/utils/request'
import qs from 'querystring'
export function getAllRoles() {
  return request.get('api/Role/GetAll', null)
}
