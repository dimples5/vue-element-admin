import request from '@/utils/request'

export function loginByUsername(username, password) {
  const data = {
    username,
    password
  }
  console.log(
    request({
      url: '/login/login',
      method: 'post',
      data
    })
  )
  return request({
    url: '/login/login',
    method: 'post',
    data
  })
}

export function logout() {
  return request({
    url: '/login/logout',
    method: 'post'
  })
}

export function getUserInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}
// ---------------------------------------------以下是角色业务使用接口---------------------------------------------,
/**
 * 获取所有Role 角色信息表
 */
export function getRoleAll(params) {
  return request({
    url: '/Role/GetAll',
    method: 'post',
    params: params
  })
}
/**
 * 添加一条 role 信息
 */
export function roleAdd(params) {
  return request({
    url: '/Role/Put',
    method: 'post',
    params: params
  })
}
/**
 * 根据 roleid 删除一条role 信息
 */
export function roleDelete(id) {
  return request({
    url: '/Role/Delete?id=' + id,
    method: 'delete'
  })
}
/**
 * 修改一条 role 信息
 */
export function roleUpdate(params) {
  return request({
    url: '/Role/Update',
    method: 'put',
    params: params
  })
}
// ---------------------------------------------以下是菜单使用接口---------------------------------------------,
/**
 * 获取最新一条菜单记录
 */
export function getMenu() {
  return request({
    url: '/Menu/1',
    method: 'get'
  })
}
// ---------------------------------------------以下是API权限permission接口---------------------------------------------
/**
 * 获取所有按钮API
 */
export function getPermission() {
  return request({
    url: '/Role/GetPermission',
    method: 'get'
  })
}
/**
 *  根据roleid 获取按钮API
 * roleid若为多个 可为 “,”隔开数组
 */
export function GetRolePermission(roleId) {
  return request({
    url: '/Role/GetRolePermission?roleId=' + roleId,
    method: 'get'
  })
}
/**
 *
 *  保存 修改 的Role 对应 permissionAPI
 */
export function SaveRolePermission(params) {
  return request({
    url: '/Role/SaveRolePermission',
    method: 'put',
    params: params
  })
}
