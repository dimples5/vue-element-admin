import {
  loginByUsername,
  logout,
  getUserInfo,
  getRoleAll,
  roleAdd,
  roleDelete,
  roleUpdate,
  getMenu,
  getPermission,
  GetRolePermission,
  SaveRolePermission
} from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'

const user = {
  state: {
    user: '',
    status: '',
    code: '',
    token: getToken(),
    name: '',
    avatar: '',
    introduction: '',
    roles: [],
    setting: {
      articlePlatform: []
    }
  },

  mutations: {
    SET_CODE: (state, code) => {
      state.code = code
    },
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_INTRODUCTION: (state, introduction) => {
      state.introduction = introduction
    },
    SET_SETTING: (state, setting) => {
      state.setting = setting
    },
    SET_STATUS: (state, status) => {
      state.status = status
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    }
  },

  actions: {
    // 用户名登录
    LoginByUsername({ commit }, userInfo) {
      const username = userInfo.username.trim()
      return new Promise((resolve, reject) => {
        loginByUsername(username, userInfo.password)
          .then(response => {
            const data = response.data
            console.log(data.token)
            commit('SET_TOKEN', data.token)
            setToken(response.data.token)
            resolve()
          })
          .catch(error => {
            reject(error)
          })
      })
    },

    // 获取用户信息
    GetUserInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getUserInfo(state.token)
          .then(response => {
            // 由于mockjs 不支持自定义状态码只能这样hack
            if (!response.data) {
              reject('Verification failed, please login again.')
            }
            const data = response.data

            if (data.roles && data.roles.length > 0) {
              // 验证返回的roles是否是一个非空数组
              commit('SET_ROLES', data.roles)
            } else {
              reject('getInfo: roles must be a non-null array!')
            }

            commit('SET_NAME', data.name)
            commit('SET_AVATAR', data.avatar)
            commit('SET_INTRODUCTION', data.introduction)
            resolve(response)
          })
          .catch(error => {
            reject(error)
          })
      })
    },

    // 第三方验证登录
    // LoginByThirdparty({ commit, state }, code) {
    //   return new Promise((resolve, reject) => {
    //     commit('SET_CODE', code)
    //     loginByThirdparty(state.status, state.email, state.code).then(response => {
    //       commit('SET_TOKEN', response.data.token)
    //       setToken(response.data.token)
    //       resolve()
    //     }).catch(error => {
    //       reject(error)
    //     })
    //   })
    // },

    // 登出
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout(state.token)
          .then(() => {
            commit('SET_TOKEN', '')
            commit('SET_ROLES', [])
            removeToken()
            resolve()
          })
          .catch(error => {
            reject(error)
          })
      })
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        removeToken()
        resolve()
      })
    },

    // 动态修改权限
    ChangeRoles({ commit, dispatch }, role) {
      return new Promise(resolve => {
        commit('SET_TOKEN', role)
        setToken(role)
        getUserInfo(role).then(response => {
          const data = response.data
          commit('SET_ROLES', data.roles)
          commit('SET_NAME', data.name)
          commit('SET_AVATAR', data.avatar)
          commit('SET_INTRODUCTION', data.introduction)
          dispatch('GenerateRoutes', data) // 动态修改权限后 重绘侧边菜单
          resolve()
        })
      })
    }
  }
}

// ---------------------------------------------以下是角色业务使用接口---------------------------------------------,
const role = {
  /**
   * 获取所有Role 角色信息表
   */
  getRoleAll({ commit, dispatch }, params) {
    return new Promise((resolve, reject) => {
      getRoleAll(params)
        .then(response => {
          resolve(response.data)
        })
        .catch(error => {
          reject(error)
        })
    })
  },
  /**
   * 添加一条 role 信息
   */
  roleAdd({ commit, dispatch }, role) {
    return new Promise((resolve, reject) => {
      roleAdd(role)
        .then(response => {
          resolve(response.data)
        })
        .catch(error => {
          reject(error)
        })
    })
  },
  /**
   * 根据 roleid 删除一条role 信息
   */
  roleDelete({ commit, dispatch }, id) {
    return new Promise((resolve, reject) => {
      roleDelete(id)
        .then(response => {
          resolve(response.data)
        })
        .catch(error => {
          reject(error)
        })
    })
  },
  /**
   * 修改一条 role 信息
   */
  roleUpdate({ commit, dispatch }, role) {
    return new Promise((resolve, reject) => {
      roleUpdate(role)
        .then(response => {
          resolve(response.data)
        })
        .catch(error => {
          reject(error)
        })
    })
  }
}
// ---------------------------------------------以下是菜单使用接口---------------------------------------------,
const menu = {
  /**
   * 获取最新一条菜单记录
   */
  getMenu({ commit, dispatch }) {
    return new Promise((resolve, reject) => {
      getMenu()
        .then(response => {
          resolve(response.data)
        })
        .catch(error => {
          reject(error)
        })
    })
  }
}
// ---------------------------------------------以下是API权限permission接口---------------------------------------------
const permission = {
  /**
   * 获取所有按钮API
   */
  getPermission({ commit, dispatch }) {
    return new Promise((resolve, reject) => {
      getPermission()
        .then(response => {
          resolve(response.data)
        })
        .catch(error => {
          reject(error)
        })
    })
  },
  /**
   *  根据roleid 获取按钮API
   * roleid若为多个 可为 “,”隔开数组
   */
  GetRolePermission({ commit, dispatch }, roleId) {
    return new Promise((resolve, reject) => {
      GetRolePermission(roleId)
        .then(response => {
          resolve(response.data)
        })
        .catch(error => {
          reject(error)
        })
    })
  },
  /**
   *  保存 修改 的Role 对应 permissionAPI
   *
   */
  SaveRolePermission({ commit, dispatch }, params) {
    return new Promise((resolve, reject) => {
      SaveRolePermission(params)
        .then(response => {
          resolve(response.data)
        })
        .catch(error => {
          reject(error)
        })
    })
  }
}
// 暂时和User 一起输出
user.actions = Object.assign(user.actions, role)
user.actions = Object.assign(user.actions, menu)
user.actions = Object.assign(user.actions, permission)
export default user
