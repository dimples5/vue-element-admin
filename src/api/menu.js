import request from '@/utils/request'
// 获取菜单
export function getAsyncRouters() {
  return request({
    url: 'api/Menu/1',
    method: 'get'
  })
}
