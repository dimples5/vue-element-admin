import { constantRouterMap } from '@/router'
import { getAsyncRouters } from '@/api/menu'
import Layout from '@/views/layout/Layout'
/**
 * 通过meta.role判断是否与当前用户权限匹配
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * 递归过滤异步路由表，返回符合用户角色权限的路由表
 * @param routes asyncRouterMap
 * @param roles
 */
function filterAsyncRouter(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRouter(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const permission = {
  state: {
    routers: [],
    addRouters: []
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
    }
  },
  actions: {
    GenerateRoutes({ commit }, data) {
      const routes = constantRouterMap
      commit('SET_ROUTERS', constantRouterMap)
      return new Promise((resolve, reject) => {
        // const { roles } = data
        // let accessedRouters
        // if (roles.includes('admin')) {
        //   accessedRouters = asyncRouterMap
        // } else {
        //   accessedRouters = filterAsyncRouter(asyncRouterMap, roles)
        // }
        // commit('SET_ROUTERS', accessedRouters)
        // resolve()
        getAsyncRouters()
          .then(res => {
            const asyncRouterMap = res.data
            let accessedRouters
            const roles = window.vm.$store.getters.roles
            if (roles.includes('admin')) {
              accessedRouters = asyncRouterMap
            } else {
              accessedRouters = filterAsyncRouter(asyncRouterMap, roles)
            }
            appendChild(accessedRouters)
            commit('SET_ROUTERS', accessedRouters)
            routes.concat(accessedRouters)
            resolve(routes)
          })
          .catch(error => {
            reject(error)
          })
      })
    }
  }
}
function appendChild(routes, fatherPath = '') {
  routes.forEach((item, index) => {
    if (item.children && item.path.includes('/')) {
      item.component = Layout
      appendChild(item.children, item.path)
    } else if (item.children && !item.path.includes('/')) {
      const viewPath = `${fatherPath}/${item.path}`
      item.component = () => import(`@/views${viewPath}`)
      fatherPath = viewPath
      appendChild(item.children, viewPath)
    } else if (!item.children) {
      const viewPath = `${fatherPath}/${item.path}`
      item.component = () => import(`@/views${viewPath}`)
    }
  })
}

export default permission
