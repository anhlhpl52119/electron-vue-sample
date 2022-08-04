<template>
  <div>
    <div style="display: flex; ">
      <a-button
        type="primary"
        style="margin-left: auto"
        :disabled="exportCsv.isExporting"
        @click="handleExportBtnClick"
      >
        Export
      </a-button>

      <a-progress
        v-if="exportCsv.isExporting"
        style="margin-left: 10px"
        :percent="exportCsv.progress"
      />
    </div>
    

    <br>
    <a-alert
      v-show="!!errorMessage"
      :message="errorMessage"
      type="error"
    />
    <p>
      <b>{{ pagination.total }}</b> records
    </p>

    <div style="">
      <a-table
        class="table-wrapper"
        row-key="_id"
        :data-source="rows" 
        :columns="columns"
        :loading="isLoading"
        :pagination="{
          size: 'small',
          'show-size-changer': true,
          total: pagination.total,
          current: pagination.current,
          pageSize: pagination.pageSize
        }"
        :scroll="{ 
          x: columns.length * 120, 
          y: 600 
        }"
        bordered
        @change="handleTableChange"
      />
    </div>
  </div>
</template>

<script>

import SqlExecutorService from "@/services/sql_executor"
import CsvExporterService from "@/services/csv_exporter"
const { dialog } = require('@electron/remote')

export default {
  props: {
    sql : {
      type: String,
      default: ""
    }
  },
  data: function() {
    return {
      rows: [],
      columns: [],
      isLoading: false,
      pagination: {
        pageSize: 10,
        total: 0,
        current: 1
      },
      exportCsv: {
        progress: 0,
        isExporting: false
      },
      errorMessage: ""
    }
  },
  watch: {
    sql: async function(val) {
      await this.fetchData()

    }
  },
  async created() {
    await this.fetchData()
  },
  methods: {
    initData() {
      this.columns = []
      this.rows = []
      this.pagination = {
        pageSize: 10,
        total: 0,
        current: 1
      }
    },
    async fetchData() {
      if(this.sql) {
        try {
          this.errorMessage = ""
          this.isLoading = true
          this.pagination.total = await SqlExecutorService.getNumberOfRecords(this.sql)
          const rows = await SqlExecutorService.getRows(this.sql, this.pagination.current, this.pagination.pageSize)
          
          this.rows = rows.map((row, index) => {
            return {
              _id: (this.pagination.current - 1) * this.pagination.pageSize + index + 1,
              ...row
            }
          })
          this.columns = [{
              title: "#",
              dataIndex: "_id",
              key: "_id",
              resizable: true

            }].concat(Object.keys(rows[0] || {}).map(column => {
            return {
              title: column,
              dataIndex: column,
              key: column,
              resizable: true
            }
          }))

        } catch (error) {
          console.error(error)
          this.errorMessage = error.message
        } finally {
          this.isLoading = false

        }
        

      } else {
        this.initData()
      }
    },
    handleTableChange: function(pagination) {
      this.pagination.current = pagination.current
      this.pagination.pageSize = pagination.pageSize
      this.fetchData()
    },

    async handleExportBtnClick() {
      if(this.sql){
        const dialogOption = {
          defaultPath: `data_${Date.now()}.csv`,
          filters: [
            {name: 'csv', extensions: ['csv']},
            { name: 'All Files', extensions: ['*'] }
          ]
        }

        const userChosen = await dialog.showSaveDialog(dialogOption);
        if(!userChosen.canceled) {
          
          const { filePath } = userChosen
          this.exportCsv.isExporting = true
          this.exportCsv.progress = 0
          await CsvExporterService.exportToCsv(this.sql, filePath, {
            onProgress: (progress) => {
              this.exportCsv.progress = parseInt(progress)
            }
          })
          this.exportCsv.isExporting = false
          this.$message.success("Exporting file successfully!")
        }


      }
    }
  }
}
</script>
<style lang="scss" scoped>
.table-wrapper :deep() .ant-table {
border: 1px solid #f0f0f0
}
</style>