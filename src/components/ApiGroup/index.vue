<template>
  <div>
    <h2>{{ row==null?'查看':row.roleName }}</h2>
    <el-tree
      ref="mytree"
      :data="TreeData.default"
      :show-checkbox="checkShow"
      :props="defaultProps"
      node-key="name"
      highlight-current
      default-expand-all
    />
  <button v-if="row!=null" @click="submit">提交</button></div>
</template>
<script>
export default {
  props: {
    data: {
      type: Promise,
      default: null
    },
    row: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      TreeData: {
        type: Object,
        default: []
      },
      defaultProps: {
        children: 'children',
        label: 'name'

      },
      checkShow: true
    }
  },
  watch: {
    row(newval, oldVal) {
      if (newval) {
        this.ckeInit(newval.id)
      }
      // JSON.stringify(t).replace(/\[|]/g,'')
    }
  },
  mounted() {
    this.data.then(res => { this.TreeData.default = res })
    if (this.row != null) { this.ckeInit(this.row.id) }
  },
  methods: {
    ckeInit(roleId) {
      this.$store.dispatch('GetRolePermission', roleId).then(res => {
        setTimeout(() => {
          // Elementui 中封装好的组件中调用相关方法，必须使用异步具体原因与框架代码执行有关
          this.$refs.mytree.setCheckedKeys(res)
        }, 10)
      })
    },
    submit() {
      const params = {
        roleId: this.row.id,
        pagePermission: JSON.stringify(this.$refs.mytree.getCheckedKeys()).replace(/\[|]/g, '')
      }
      this.$confirm('将同步' + this.row.roleName + 'API权限 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('SaveRolePermission', params).then(res => {
          console.log('ok')
          // 成功 this.$emit('headCallBack', null)
        }).catch(err => {
          console.log(err)
        })
      }).catch((err) => {
        console.log(err)
      })
    }
  }
}
</script>

