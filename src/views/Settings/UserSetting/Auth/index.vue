<template >
  <div style="padding:10px;">
    <el-input v-model="page.input" placeholder="请输入内容" style="width:20%"/>
    <el-button type="primary" icon="el-icon-search" @click="init()">搜索</el-button>
    <el-button-group style="padding-left:45%">
      <el-button icon="el-icon-refresh" @click="init()"/>
      &nbsp;
      <el-button icon="el-icon-circle-plus-outline" @click="dialogForm.dialogFormVisibleRoleAdd=true">新增</el-button>
      <el-button icon="el-icon-edit" @click="updateSubmit('click')">编辑</el-button>
      <el-button icon="el-icon-delete" @click="deleteSubmit">删除</el-button>
    </el-button-group>
    <el-dropdown>
      <el-button>
        更多<i class="el-icon-arrow-down el-icon--right"/>
      </el-button>
      <el-dropdown-menu slot="dropdown" style="width:100px">
        <el-dropdown-item>新增API</el-dropdown-item>
        <el-dropdown-item>查看API</el-dropdown-item>
        <el-dropdown-item ><span @click="dialogForm.dialogFormVisiblePermission=true">按钮授权</span></el-dropdown-item>
        <el-dropdown-item ><span @click="dialogForm.dialogFormVisibleRole=true">页面授权</span></el-dropdown-item>
        <el-dropdown-item>未完待续</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <hr>
    <el-table
      v-loading="loading"
      :data="tableData"
      :border="true"
      :header-cell-style="{background:'#eef1f6',color:'#606266'}"
      highlight-current-row
      prop="login_id"
      @current-change="handleCurrentChange">
      <el-table-column
        :index="indexMethod"
        align="center"
        fit
        type="index"
        label=" "/>
      <el-table-column label="角色编号" width="80px">
        <template slot-scope="scope">
          <span style="margin-left: 10px">{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="角色名称" width="300">
        <template slot-scope="scope">
          <span style="margin-left: 10px">{{ scope.row.roleName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="200" sortable>
        <template slot-scope="scope">
          <span style="margin-left: 10px">{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建人" width="200">
        <template slot-scope="scope">
          <span style="margin-left: 10px">超级管理员</span>
        </template>
      </el-table-column>
      <el-table-column label="有效" width="55">
        <template slot-scope="scope">
          <el-switch
            v-model="swith"
          />
        </template>
      </el-table-column>
      <el-table-column label="描述">
        <template slot-scope="scope">
          <span style="margin-left: 10px">{{ scope.row.description }}</span>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination
      :page-sizes="[6, 8, 10, 20]"
      :page-size="page.pageSize"
      :total="page.total"
      background
      layout="prev, pager, next, sizes, total, jumper"
      @current-change="pageCurrentChange"
      @size-change="pageSizeChange"
    />
    <el-dialog :visible.sync="dialogForm.dialogFormVisiblePermission" title="设置角色API权限">
      <apigroup :data="getPermission" :row="ckeRow"/>
    </el-dialog>
    <!--编辑角色权限 弹出框 -->
    <el-dialog :visible.sync="dialogForm.dialogFormVisibleRole" title="设置角色页面权限">
      <!-- 树形菜单 -->
      <treelist :data="menu" :roles="roles"/>
    </el-dialog>

    <!-- 添加角色信息 -->
    <el-dialog :visible.sync="dialogForm.dialogFormVisibleRoleAdd" title="添加角色" width="30%">
      <el-form :model="modelAdd" :rules="roleRules" label-width="80px">
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model.trim="modelAdd.roleName"/>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="modelAdd.description"/>
        </el-form-item>
        <el-form-item>
          <el-button @click="addSubmit">立即创建</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- 编辑角色信息 -->
    <el-dialog :visible.sync="dialogForm.dialogFormVisibleRoleUpdate" :rules="roleRules" title="编辑角色" width="30%">
      <el-form :model="modelUpdate" :rules="roleRules" label-width="80px">
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model.trim="modelUpdate.roleName"/>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="modelUpdate.description"/>
        </el-form-item>
        <el-form-item>
          <el-button @click="updateSubmit('submit')">修改</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
// import axios from 'axios'
import treelist from '../../../../components/TreeList'
import apigroup from '../../../../components/ApiGroup'
import menu from '../../../../assets/js/menu'
export default {
  components: {
    treelist,
    apigroup
  },
  data() {
    return {
      ckeRow: null, // 当前选中行
      tableData: [],
      loading: true,
      swith: true,
      dialogForm: {
        dialogFormVisibleRole: false,
        dialogFormVisibleRoleAdd: false,
        dialogFormVisibleRoleUpdate: false,
        dialogFormVisiblePermission: false
      },
      page: {
        input: '', // 搜索的输入框
        pageSize: 6, // 一页多少行
        pageNumber: 1, // 第几页
        total: 0 // 查询出的总行数
      },
      modelAdd: {
        roleName: '',
        description: ''
      },
      modelUpdate: {
        id: 0,
        roleName: '',
        description: ''
      },
      roleRules: {
        roleName: [{ required: true, message: '未填写角色名', trigger: 'blur' }]
      }

    }
  },
  computed: {
    menu() {
      return menu
      // console.log(this.getMenu())
      // return this.getMenu()
    },
    roles() {
      if (this.ckeRow != null) { return [...[], this.ckeRow.roleName] }
      return []
    },
    inputName() {
      return this.page.input
    },
    getPermission() {
      return this.$store.dispatch('getPermission')
    }
  },
  watch: {
    inputName() {
      this.init()
    }
  },
  created() {
    this.init()
    // this.getPermission()
  },
  methods: {
    getMenu() {
      return this.$store.dispatch('getMenu')
    },

    init() {
      this.loading = true
      this.ckeRow = null
      this.$store.dispatch('getRoleAll', this.page).then(res => {
        setTimeout(() => {
          this.loading = false
          this.tableData = res.list
          this.page.total = res.total
        }, 500)
        this.dialogForm = {
          dialogFormVisibleRole: false,
          dialogFormVisibleRoleAdd: false,
          dialogFormVisibleRoleUpdate: false,
          dialogFormVisiblePermission: false
        }
      })
    },
    // 分页
    pageCurrentChange(cpage) {
      this.page.pageNumber = cpage
      this.init()
    },
    // 分页
    pageSizeChange(psize) {
      this.page.pageSize = psize
      this.init()
    },
    indexMethod(index) {
      return index + 1
    },
    handleCurrentChange(row) {
      // 选中一行
      this.ckeRow = row
    },
    /**
     * 添加一条 role 信息
     */
    addSubmit() {
      this.confirm('是否添加', 'roleAdd', this.modelAdd)
    },
    /**
     * 删除一条 role 信息
     */
    deleteSubmit() {
      if (this.ckeRow === null) {
        this.openBad('请先选中一行')
      } else {
        this.confirm(this.ckeRow.roleName + '是否删除', 'roleDelete', this.ckeRow.id)
      }
    },
    /**
      * 修改一条 role 信息
      */
    updateSubmit(type) {
      if (type === 'click') {
        if (this.ckeRow === null) {
          this.openBad('请先选中一行')
        } else {
          this.dialogForm.dialogFormVisibleRoleUpdate = true
          this.modelUpdate = { 'id': this.ckeRow.id, 'roleName': this.ckeRow.roleName, 'description': this.ckeRow.description }
        }
      } else if (type === 'submit') {
        this.confirm(this.ckeRow.roleName + '是否修改', 'roleUpdate', this.modelUpdate)
      } else {
        return
      }
    },
    async confirm(msg, request, params) {
      return await new Promise((resolve, reject) => {
        this.$confirm(msg + ', 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$store.dispatch(request, params).then(res => {
            this.openSuccess()
            this.init()
            resolve(res)
          }).catch(err => {
            console.log(err)
          })
        }).catch(() => {
          this.openBad('已取消')
        })
      })
    },
    openBad(msg) {
      this.$message({
        type: 'info',
        message: msg
      })
    },
    openSuccess(msg = '') {
      this.$message({
        type: 'success',
        message: msg + '成功'
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.el-input-group__append button.el-button {
	color: #fff;
	border: none;
	background-color: #317ef3;
}
</style>

