const utility = {}
export default utility
utility.getNowFormatDate = () => {
  var date = new Date()
  var seperator1 = '-'
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var strDate = date.getDate()
  if (month >= 1 && month <= 9) {
    month = '0' + month
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = '0' + strDate
  }
  var currentdate = year + seperator1 + month + seperator1 + strDate
  return currentdate
}
utility.getQueryString = name => {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
  var r = window.location.search.substr(1).match(reg)
  if (r !== null) return unescape(r[2])
  return null
}

utility.toFixed = (val, num) => {
  let vals = val
  if (val === undefined || val === null || val === '') {
    return ''
  } else {
    return vals.toFixed(num)
  }
}

// 填充位数
utility.preZeroFill = (num, size) => {
  if (num >= Math.pow(10, size)) {
    return num.toString()
  } else {
    var _str = Array(size + 1).join('0') + num
    return _str.slice(_str.length - size)
  }
}

/*
 * param 将要转为URL参数字符串的对象
 * key URL参数字符串的前缀
 * encode true/false 是否进行URL编码,默认为true
 *
 * return URL参数字符串
 */
utility.urlEncode = (param, key, encode) => {
  if (param === null) return ''
  var paramStr = ''
  var t = typeof param
  if (t === 'string' || t === 'number' || t === 'boolean') {
    paramStr +=
      '&' +
      key +
      '=' +
      (encode === null || encode ? encodeURIComponent(param) : param)
  } else {
    for (const i in param) {
      var k =
        key === null || key === undefined
          ? i
          : key + (param instanceof Array ? '[' + i + ']' : '.' + i)
      paramStr += this.urlEncode(param[i], k, encode)
    }
  }
  return paramStr
}

utility.displayProp = obj => {
  var props = ''
  Object.keys(obj).forEach(element => {
    props += element + ':' + obj[element] + ', '
  })
  return props
}

utility.formatDate = obj => {
  var date = new Date(obj)
  var dateTime = ''
  dateTime =
    date.getFullYear() +
    '-' +
    (date.getMonth() + 1) +
    '-' +
    date.getDate() +
    ' ' +
    date.getHours() +
    ':' +
    date.getMinutes()
  return dateTime
}

/* ------------------以下方法为权限所要用到的工具方法------------------------------- */
/* 判断两个数组是否相等 */
// Vue.prototype.EqualToArr = equalToArr

// menu 总菜单
// lacklist 残缺菜单
// fatherarr所有父级的arr
// ii 循环 补充头,ii为 父级菜单层数，本项目为2
utility.headChangeImprove = (menu, lacklist, ii) => {
  if (lacklist.length !== 0) {
    for (let i = 0; i < ii; i++) {
      HeadChange(menu, lacklist, '')
    }
  }
}

function HeadChange(menu, lacklist, fathName) {
  menu.forEach(route => {
    const tmp = { ...route }
    if (tmp.hasOwnProperty('children')) {
      if (fathName !== '') {
        if (lacklist.includes(tmp.name)) {
          lacklist.push(fathName)
        }
      }
      if (tmp.children.length > 0) {
        HeadChange(tmp.children, lacklist, tmp.name)
      }
    }
  })
}

// 判断两个数组中值是否都相互包含
utility.equalToArr = (arr1, arr2) => {
  if (arr1.length !== arr2.length) {
    return false
  }
  if ((arr1.length === arr2.length) === 0) {
    return true
  }
  let boo = true
  arr2.forEach(element => {
    if (arr1.indexOf(element) === -1) {
      boo = false
    }
  })
  return boo
}

// 删除数组中指定索引的值
function removeArrindex(arr, index) {
  if (index > -1) {
    arr.splice(index, 1)
  }
  return arr
}

/* 根据数组中匹配的val值删除数组中指定值 */
utility.removeArrVal = (arr, val) => {
  let index = arr.indexOf(val)
  return removeArrindex(arr, index)
}

/* 获取对应角色的菜单，用于展示树形菜单权限勾选 */
utility.filterCke = (treeMenu, roles) => {
  let res = []
  treeMenu.forEach(route => {
    if (route.meta) {
      const tmp = { ...route }
      if (
        route.meta.roles.filter(item => roles.indexOf(item) > -1).length > 0
      ) {
        if (tmp.children && tmp.children.length > 0) {
          const ress = utility.filterCke(tmp.children, roles)
          res = res.concat(ress)
        }
        res.push(tmp.title)
      }
    }
  })
  return res
}

/**
 * 递归过滤异步路由表，返回father 菜单
 * @param routes asyncRouterMap
 */
utility.filterRouterIsFather = routes => {
  let res = []
  routes.forEach(route => {
    const tmp = { ...route }
    if (tmp.hasOwnProperty('children')) {
      if (tmp.children.length > 0) {
        res.push(tmp.title)
        const ress = utility.filterRouterIsFather(tmp.children)
        res = res.concat(ress)
      }
    }
  })
  return res
}

// 从Menu找到有哪些角色，用于统计数据 Role 名
utility.GroupRoles = treeMenu => {
  let arrRoles = []
  treeMenu.forEach(route => {
    const tmp = { ...route }
    route.meta.roles.forEach(role => {
      if (!arrRoles.includes(role)) {
        arrRoles.push(role)
      }
    })
    if (tmp.children.length > 0) {
      utility.GroupRoles(tmp.children)
    }
  })
  return arrRoles
}

// 根据角色计算出所拥有页面的总和
function GroupCount(treeMenu, Role) {
  let i = 0
  treeMenu.forEach(route => {
    const tmp = { ...route }
    if (route.meta.roles.includes(Role)) {
      i++
    }
    if (tmp.children.length > 0) {
      i += GroupCount(tmp.children, Role)
    }
  })
  return i
}
// 累计返回Array
utility.GroupPage = (treeMenu, arrRoles) => {
  let arrcount = []
  arrRoles.forEach((Role, index) => {
    arrcount[index] = GroupCount(treeMenu, Role)
  })
  return arrcount
}
