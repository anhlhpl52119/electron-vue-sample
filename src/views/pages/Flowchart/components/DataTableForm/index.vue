<template>
  <a-form
    :model="formState"
    name="basic"
    layout="vertical"
    autocomplete="off"
  >
    <a-form-item
      label="Name" 
      name="code"
      :rules="[{ required: true, message: 'Please input name!' }]"
    >
      <a-input
        :value="formState.code"
        @change="handleCodeChange"
      />
    </a-form-item>
      

    <a-form-item
      label="Data table"
      name="dataTable"
    >
      <a-select
        ref="select"
        v-model:value="formState.dataTable"
        @change="handleImportedTableChange"
      >
        <a-select-option
          v-for="importedTable in importedTables"
          :key="importedTable.id"
          :value="importedTable.logicalTableName"
        >
          {{ importedTable.logicalTableName }}
        </a-select-option>
      </a-select>
    </a-form-item>
  </a-form>
</template>

<script>

import CONSTANTS from "@/constants/index"
const { QUERY_CONSTANT } = CONSTANTS

  export default {
    props: {
      selectedNode: {
        type: Object,
        default: () => null
      },
      importedTables: {
        type: Array,
        default: () => []
      }
    },

    emits: ['submit', 'change'],
    data: function() {
      return {
        formState: {
          select: [],
          code: "",
          dataTable: ""
        }
      }
    },

    watch: {
      selectedNode: function() {
        this.setFormState(this.selectedNode?.data)
      },

      formState: {
        handler: function() {
          const data = {
            ...this.selectedNode?.data,
            code: this.formState.code,
            select: this.formState.select,
            from: {
              code: this.formState.dataTable
            }
          }
          this.$emit("change", JSON.parse(JSON.stringify(data)))
        },
        deep: true
      }
    },
    created: async function() {
      this.setFormState(this.selectedNode?.data)
    },
    methods: {
      async handleImportedTableChange(value) {
        const importedTable = this.importedTables.find(improtedTable => improtedTable.logicalTableName === value)
        if(importedTable) {
          const importedTableFields =  importedTable.imported_table_fields

          this.formState.select = importedTableFields.map(importedTableField => ({
            field: importedTableField.fieldName,
            table: value,
            alias: importedTableField.fieldName,
            type: QUERY_CONSTANT.SELECT.TYPE.TABLE_FIELD
          }))
        } else {
          this.formState.select = []
        }
      },

      setFormState(data) {
        if(data) {
          this.formState['code'] = data['code']
          this.formState['dataTable'] = data['from']?.['code']
          this.formState['select'] = data['select']
        } else {
          this.formState['code'] = ""
          this.formState['dataTable'] = ""
          this.formState['select'] = []
        }
      },

      handleCodeChange(e) {
        if(e.target.value) {
          this.formState.code = e.target.value.replace(/[^\w\d]/gi, '')
        } else {
          this.formState.code = ''
        }
      }
    }
  }
  </script>