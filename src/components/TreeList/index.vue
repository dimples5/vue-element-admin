<template>
  <div>
    <div v-if="isoperation">
      <h2>{{ roles }}</h2>
    </div>
    <el-tree
      ref="mytree"
      :data="TreeData.default"
      :show-checkbox="checkShow"
      :props="defaultProps"
      node-key="title"
      highlight-current
      default-expand-all
    />
    <div v-if="isoperation">
      <el-button @click="typeTree(false)">取 消</el-button>
      <el-button type="primary" @click="typeTree(true)">保存修改</el-button>
      <el-button type="primary" @click="clear">清空</el-button>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    data: {
      type: Array,
      default: null
    },
    roles: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      TreeData: {
        type: Array,
        default: []
      },
      defaultProps: {
        children: 'children',
        label: 'title',
        roles: 'admin',
        ArrayRole: [] // 修改前的权限数组
      },
      checkShow: true

    }
  },
  computed: {
    fatherArr() {
      if (this.data != null) {
        return this.utility.filterRouterIsFather(this.data)
      } else {
        return []
      }
    },
    isoperation() {
      return this.roles.length > 0
    }

  },
  watch: {
    roles(newval, oldVal) {
      this.init()
    }
  },
  mounted() {
    this.TreeData.default = this.data
    // this.TreeData.default = store.getters.treeMenu // Tree数据填充
    // console.log('我在初始化子组件')
    this.init()
  },
  methods: {
    init() {
      const arr = this.utility.filterCke(
        this.data,
        this.roles
      ) // 该角色应该选中的菜单
      const arrs = [...arr]
      arrs.forEach(item => {
        // 过滤掉父级菜单的数据
        if (this.fatherArr.includes(item)) {
          this.utility.removeArrVal(arr, item)
        }
      })
      this.ArrayRole = arr
      setTimeout(() => {
        // Elementui 中封装好的组件中调用相关方法，必须使用异步具体原因与框架代码执行有关
        this.$refs.mytree.setCheckedKeys(arr)
      }, 10)
    },
    clear() {
      this.$refs.mytree.setCheckedKeys([])
    },
    typeTree(type) {
      if (type) {
        if (this.roles.includes('admin') || this.roles.includes('Admin')) {
          this.$message({
            type: 'info',
            message: 'admin权限禁止操作'
          })
        } else {
          this.$confirm('此操作将修改该用户所有权限, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(() => {
              // 获取当前选中菜单的数组
              const arrlack = this.$refs.mytree.getCheckedKeys()
              // 去除头部菜单
              const arrs = [...arrlack]
              arrs.forEach(item => {
                if (this.fatherArr.includes(item)) {
                  this.utility.removeArrVal(arrs, item)
                }
              })
              // 比较修改后的值与 传进来的值是否有变，避免不必要的数据交互
              if (this.utility.equalToArr(this.ArrayRole, arrs)) {
                this.$message({
                  type: 'info',
                  message: '数据未修改'
                })
              } else {
                // Set 类型的特性可自动过滤掉重复字段
                const data = {
                  Array: [...new Set(arrs)],
                  roles: this.roles
                }
                console.log(data)
                console.log('end')
                // 向父组件回调函数中传入 保存权限的数据
                // this.$emit('headCallBack', data)
              }
            })
            .catch(() => {
              this.$message({
                type: 'info',
                message: '已取消'
              })
            })
        }
      } else {
        // 取消操作时 返回null
        this.$emit('headCallBack', null)
      }
    }
  }
}
</script>
