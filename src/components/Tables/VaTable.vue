<template>
  <div class="vaTable">
    <table-toolbar
      :show-search="showSearch"
      v-model="search"
      :show-export="showExport"
      :show-refresh="showRefresh"
      @refresh="refresh"
    />
    <el-table v-loading="loading" :columns="columns" :data="filteredTableData" style="width: 100%">
      <el-table-column
        v-for="column in columns"
        :label="column.label"
        :prop="column.prop"
        :type="column.type"
        :width="column.width"
        :key="column.prop"
        :formatter="column.formatter"
      >
        <div>asdf</div>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import TableToolbar from '@/components/Tables/TableToolbar'
export default {
  name: 'VaTable',
  components: { TableToolbar },
  props: {
    // search: {
    //   type: String,
    //   default: ''
    // },
    // tableData: {
    //   type: Array,
    //   default() {
    //     return []
    //   }
    // },
    columns: {
      type: Array,
      default() {
        return []
      }
    },
    showSearch: {
      type: Boolean,
      default: false
    },
    clickToSelect: {
      type: Boolean,
      default: false
    },
    multiSelect: {
      type: Boolean,
      default: false
    },
    showExport: {
      type: Boolean,
      default: false
    },
    showRefresh: {
      type: Boolean,
      default: false
    },
    // loading: {
    //   type: Boolean,
    //   default: false
    // },
    url: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      search: '',
      tableData: [],
      loading: false
    }
  },
  computed: {
    filteredTableData() {
      return this.tableData.filter(
        data =>
          !this.search ||
          // data.name.toLowerCase().includes(this.search.toLowerCase()) ||
          data.recorddate.includes(this.search))
    }
  },
  beforeMount() {
    this.getData()
  },
  mounted() {
    if (this.multiSelect) {
      this.columns.unshift({
        type: 'selection',
        width: 50,
        formatter: function() {
          return true
        }
      })
    }
    console.log(this.columns)
  },
  methods: {
    onClick(index, row) {
      console.log(index, row)
    },
    handleEdit(index, row) {
      console.log(this.search)
    },
    handleDelete(index, row) {
      console.log(index, row)
    },
    refresh() {
      this.getData()
    },
    getData() {
      this.loading = true
      window.vm.request.get(this.url)
        .then(res => {
          this.tableData = res.data
          this.loading = false
        }).catch(error => {
          console.log(error.response)
          this.loading = false
        })
    }
  }
}
</script>
