<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.where"
        placeholder="用户名/姓名"
        style="width: 200px;"
        class="filter-item"
        @input="handleFilter"
        @keyup.enter.native="handleFilter"
      />
      <el-select
        v-model="listQuery.enabled"
        placeholder="状态"
        clearable
        class="filter-item"
        style="width: 130px"
        @change="handleFilter"
      >
        <el-option key="true" :value="true" label="已启用"/>
        <el-option key="false" :value="false" label="已禁用"/>
      </el-select>
      <el-select
        v-model="listQuery.sort"
        style="width: 140px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option
          v-for="item in sortOptions"
          :key="item.key"
          :label="item.label"
          :value="item.key"
        />
      </el-select>
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >{{ $t('table.search') }}</el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >{{ $t('table.add') }}</el-button>
      <el-button
        v-waves
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >{{ $t('table.export') }}</el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="id" prop="id" sortable="custom" align="center" width="65">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户" align="center" min-width="80px">
        <template slot-scope="scope">
          <span>{{ scope.row.userName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="姓名" width="100px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.enabled | statusFilter">{{ scope.row.enabled?'启用':'禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="150px" align="center">
        <template slot-scope="scope">
          <span
            v-if="scope.row.updateTime"
          >{{ scope.row.updateTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        min-width="250px"
        width="250"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            :class="scope.row.enabled ?'el-button--danger':'el-button--success'"
            size="mini"
            type="success"
            @click="handleStatusChange(scope.row,!scope.row.enabled)"
          >{{ scope.row.enabled ?'禁用':'启用' }}</el-button>
          <el-button
            v-if="checkPermission(['admin'])"
            type="primary"
            size="mini"
            @click="handleUpdate(scope.row)"
          >编辑</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.row)"
          >{{ $t('table.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="70px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item v-if="dialogStatus==='update'" label="id" prop="id">
          <el-input v-model="temp.id" disabled/>
        </el-form-item>
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="temp.userName" :disabled="dialogStatus==='update'"/>
        </el-form-item>
        <el-form-item v-if="dialogStatus==='create'" label="密码" prop="password">
          <el-input v-model="temp.password" :type="passwordType" name="password"/>
          <span class="show-pwd" @click="showPwd">
            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'"/>
          </span>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="temp.name"/>
        </el-form-item>
        <el-form-item label="权限" prop="roles">
          <el-select v-model="temp.roles" multiple placeholder="请选择用户权限">
            <el-option
              v-for="item in roleSelections"
              :key="item.id"
              :label="item.roleName"
              :value="item.roleName"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="dialogStatus==='create'" label="状态">
          <el-select v-model="temp.enabled" placeholder="请选择">
            <el-option :key="0" :value="true" label="启用"/>
            <el-option :key="1" :value="false" label="禁用"/>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button
          type="primary"
          @click="dialogStatus==='create'?createData():updateData()"
        >{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getListPagedUser, changeUserInfo, removeUser, createUser, changeUserStatus, changeUserPassword } from '@/api/user'
import { getAllRoles } from '@/api/role'
import waves from '@/directive/waves' // Waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
// 判断是否具有权限
import checkPermission from '@/utils/permission' // 权限判断函数

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      console.table(status)
      const statusMap = {
        true: 'success',
        false: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      passwordType: 'password',
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      roleSelections: [],
      listQuery: {
        page: 1,
        limit: 20,
        importance: undefined,
        title: undefined,
        enabled: null,
        sort: 'ID',
        where: ''
      },
      importanceOptions: [1, 2, 3],
      sortOptions: [{ label: 'ID 升序', key: 'id asc' }, { label: 'ID 降序', key: 'id desc' }],
      statusOptions: [true, false],
      showReviewer: false,
      temp: {
        userName: '',
        name: '',
        password: '',
        enabled: false,
        roles: []
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑用户',
        create: '创建用户'
      },
      //   dialogPvVisible: false,
      pvData: [],
      rules: {
        userName: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
        password: [{ required: true, message: '密码不能为空', trigger: 'blur' }],
        roles: [{ required: true, message: '最少选择一个权限', trigger: 'change' }],
        name: [{ required: true, message: '姓名不能为空', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  watch: {
    temp(oldValue, newValue) {
      console.log(oldValue, newValue)
    }
  },
  created() {
    this.getList()
    this.handleGetAllRoles()
  },
  methods: {
    checkPermission(value) {
      return checkPermission(value)
    },
    showPwd() {
      debugger
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
    },
    handleGetAllRoles() {
      this.roleSelections = []
      getAllRoles().then(res => {
        this.roleSelections = res.data
      })
    },
    getList() {
      this.listLoading = true
      let queryString
      switch (this.listQuery.enabled) {
        case true:
          queryString = this.listQuery.where === '' ? 'where enabled = 1' : `where (userName like '%${this.listQuery.where}%' or name like '${this.listQuery.where}') and enabled = 1`
          break
        case false:
          queryString = this.listQuery.where === '' ? 'where enabled = 0' : `where (userName like '%${this.listQuery.where}%' or name like '${this.listQuery.where}') and enabled = 0`
          break
        case null:
          queryString = this.listQuery.where === '' ? '' : `where (userName like '%${this.listQuery.where}%' or name like '${this.listQuery.where}')`
          break
      }
      getListPagedUser({
        params: {
          pageNumber: this.listQuery.page,
          rowsPerPage: this.listQuery.limit,
          strWhere: queryString,
          orderBy: this.listQuery.sort
        }
      })
        .then(res => {
          this.list = res.data.list
          this.total = res.data.total
          this.listLoading = false
        })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleStatusChange(row, status) {
      changeUserStatus(row.id, status).then(res => {
        if (!res.data === true) {
          this.$message.error('状态更新失败')
          return
        }
        this.getList()
        if (status) {
          this.$message.success('启用成功')
        } else {
          this.$message.success('禁用成功')
        }
      })
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = 'id asc'
      } else {
        this.listQuery.sort = 'id desc'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        userName: '',
        name: '',
        password: '',
        enabled: false,
        id: 0
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createUser(this.temp).then(res => {
            this.dialogFormVisible = false
            this.getList()
            this.$notify.success('创建成功')
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj\
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          changeUserInfo(tempData.id, tempData.name, tempData.roles).then(res => {
            this.dialogFormVisible = false
            this.getList()
            this.$notify.success('更新成功')
          })
        }
      })
    },
    handleDelete(row) {
      this.$notify.success('删除成功')
      const index = this.list.indexOf(row)
      this.list.splice(index, 1)
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
        const data = this.formatJson(filterVal, this.list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    }
  }
}
</script>
<style scoped>
.show-pwd {
  position: absolute;
  right: 10px;
  top: 0px;
  font-size: 16px;
  cursor: pointer;
  user-select: none;
}
</style>
