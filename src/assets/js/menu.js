const menu = [
  {
    title: '燃料管理',
    id: '0',
    name: null,
    path: null,
    meta: {
      roles: ['Admin', 'Me']
    },
    children: [
      {
        title: '煤场动态',
        id: '0-1',
        name: 'CoalYardDynamic',
        path: '/CoalYardDynamic',
        meta: {
          roles: ['Admin', 'Me']
        },
        children: []
      },
      {
        title: '煤场管理',
        id: '0-2',
        name: 'CoalYardManage',
        path: '/CoalYardManage',
        meta: {
          roles: ['Admin', 'Me']
        },
        children: []
      },
      {
        title: '煤质管理',
        id: '0-3',
        name: 'FuelVarifyManage',
        path: '/FuelVarifyManage',
        meta: {
          roles: ['Admin', 'Me']
        },
        children: []
      },
      {
        title: '船运管理',
        id: '0-4',
        name: 'ShipManage',
        path: '/ShipManage',
        meta: {
          roles: ['Admin', 'Me']
        },
        children: []
      },
      {
        title: '数据维护',
        id: '0-5',
        name: null,
        path: null,
        meta: {
          roles: ['Admin']
        },
        children: [
          {
            title: '煤场清空记录',
            id: '0-5-0',
            name: 'StackClearView',
            path: '/StackClearView',
            meta: {
              roles: ['Admin', 'Me']
            }
          },
          {
            title: '数据库维护',
            id: '0-5-1',
            name: 'DataBaseManage',
            path: '/DataBaseManage',
            meta: {
              roles: ['Admin', 'Me']
            }
          },
          {
            title: '煤炭价格趋势',
            id: '0-5-2',
            name: 'CoalPriceView',
            path: '/CoalPriceView',
            meta: {
              roles: ['Admin', 'Me']
            }
          },
          {
            title: '机组配煤参数',
            id: '0-5-3',
            name: 'BoilerParametersManage',
            path: '/BoilerParametersManage',
            meta: {
              roles: ['Admin']
            }
          }
        ]
      }
    ]
  },
  {
    title: '智能调度',
    id: '1',
    name: null,
    path: null,
    meta: {
      roles: ['Admin']
    },
    children: [
      {
        title: '智能掺烧',
        id: '1-0',
        name: 'SmartCoal',
        path: '/SmartCoal',
        meta: {
          roles: ['Admin']
        },
        children: []
      }
    ]
  },
  {
    title: '统计分析',
    id: '2',
    name: null,
    path: null,
    meta: {
      roles: ['Admin']
    },
    children: [
      {
        title: '运行统计',
        id: '2-0',
        name: null,
        path: null,
        meta: {
          roles: ['Admin']
        },
        children: [
          {
            title: '值际竞赛',
            id: '2-0-0',
            name: 'TeamCompetition',
            path: '/TeamCompetition',
            meta: {
              roles: ['Admin']
            }
          },
          {
            title: '燃用动态',
            id: '2-0-1',
            name: 'Unit',
            path: '/Unit',
            meta: {
              roles: ['Admin']
            }
          }
        ]
      }
    ]
  },
  {
    title: '系统设置',
    id: '3',
    name: null,
    path: null,
    meta: {
      roles: ['Admin']
    },
    children: [
      {
        title: '用户设置',
        id: '3-0',
        name: null,
        path: null,
        meta: {
          roles: ['Admin']
        },
        children: [
          {
            title: '角色权限',
            id: '3-0-1',
            name: 'UserAuth',
            path: '/UserAuth',
            meta: {
              roles: ['Admin']
            }
          },
          {
            title: '账户管理',
            id: '3-0-0',
            name: 'UserView',
            path: '/UserView',
            meta: {
              roles: ['Admin']
            }
          }
        ]
      }
    ]
  }
]
export default menu
