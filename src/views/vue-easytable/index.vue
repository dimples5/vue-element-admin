<template>
  <div>
    <va-table
      :columns="columns"
      :loading="loading"
      :show-refresh="true"
      :show-export="false"
      :show-search="true"
      :url="'http://yq/threejs/service.asmx/GetCoalConsumption?year=2019&month=2'"
      height="100%"
      width="100%"
    />
  </div>
</template>

<script>
import VaTable from '@/components/Tables/VaTable'
// import axios from 'axios'
export default {
  components: { VaTable },
  data() {
    return {
      columns: [{
        type: 'selection',
        width: 50,
        formatter: function() {
          return true
        }
      },
      {
        prop: 'recorddate',
        label: '日期',
        formatter: function(row, column, prop) {
          const date = window.vm.$options.moment(prop).format('MM-DD')
          return date
        }
      }, {
        prop: 'dailygenerate',
        label: '日发电量'
      }, {
        prop: 'electricused',
        label: '厂用电量'
      }, {
        label: '厂用电率',
        formatter(row) {
          return row.electricused / row.dailygenerate * 100
        }
      }, {
        prop: 'standardcoal',
        label: '标煤用量'
      }, {
        prop: 'bunkervolume',
        label: '煤仓增量'
      }, {
        prop: 'avgload',
        label: '日均负荷'
      }, {
        prop: 'dailyqnetar',
        label: '日均热值'
      }, {
        prop: 'consumptionrate',
        label: '发电煤耗'
      }, {
        label: '供电煤耗',
        formatter(row) {
          return row.id
        }
      }],
      loading: true
    }
  },
  methods: {
    handleEdit(index, row) {
      console.log(index, row)
    },
    handleDelete(index, row) {
      console.log(index, row)
    }
  }
}
</script>
