/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/views/layout/Layout'

const nestedRouter = {
  path: '/Settings',
  component: Layout,
  redirect: '/Settings/UserSetting/User',
  name: 'Setting',
  meta: {
    title: 'Setting',
    icon: 'Setting'
  },
  children: [
    {
      path: 'UserSetting',
      component: () => import('@/views/Settings/UserSetting/index'), // Parent router-view
      name: 'UserSetting',
      meta: { title: 'UserSetting' },
      redirect: '/Settings/UserSetting/User',
      children: [
        {
          path: 'User',
          component: () => import('@/views/Settings/UserSetting/User'),
          name: 'User',
          meta: { title: 'User' }
        },
        {
          path: 'Auth',
          component: () => import('@/views/Settings/UserSetting/Auth'),
          name: 'Auth',
          meta: { title: 'Auth' }
        }
      ]
    }
  ]
}

export default nestedRouter
