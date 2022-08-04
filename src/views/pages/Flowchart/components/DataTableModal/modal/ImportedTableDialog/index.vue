<template>
  <a-modal
    :visible="isOpen"
    title="Import Data Table"
    :footer="null"
    centered
    width="80%"
    :closable="!isLoading"
    :mask-closable="false"
    @cancel="handleCloseDialog"
  >
    <a-alert
      v-if="errorMessages.length > 0"
      message="Error"
      type="error"
      show-icon
    >
      <template #description>
        <ol>
          <li
            v-for="(errorMessage, key) in errorMessages"
            :key="key"
          >
            {{ errorMessage }}
          </li>
        </ol>
      </template>
    </a-alert>

    <a-form
      ref="formRef"
      :model="formData"
      :rules="rules"

      layout="vertical"
      label-align="right"
      @submit="handleSubmit"
    >
      <a-form-item
        required
        label="Data File"
        name="attachedFile"
      >
        <div style="display: flex">
          <Uploader
            v-model:attached-file="formData.attachedFile"
            :disabled="!!record || isLoading"
          />
        </div>
      </a-form-item>

      <a-form-item
        required
        label="Table name"
        name="tableName"
      >
        <a-input v-model:value="formData.tableName" />
      </a-form-item>

      <a-form-item label="Description">
        <a-input v-model:value="formData.description" />
      </a-form-item>

      <div style="display: flex; justify-content: end">
        <a-button
          type="primary"
          :loading="isLoading"
          @click.prevent="handleSubmit"
        >
          Save
        </a-button>
      </div>
    </a-form>
  </a-modal>
</template>

<script>
import { message } from 'ant-design-vue';
import {
  checkTableNameImportedTable,
  createImportedTableData,
  updateImportedTable
} from "@/services/datatable";

import Uploader from "./Uploader.vue";

const FORM_DATA_INIT = {
  attachedFile: null,
  tableName: '',
  description: '',
}

const rules = {
  attachedFile: [
    { required: true, message: 'Required', trigger: 'change' , type: 'object'},
  ],
  tableName: [
    { required: true, message: 'Required', trigger: 'blur' },
  ]
}

export default {
  components: { Uploader },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    // if open form with new form -> record = null
    record: {
      type: Object,
      default: () => null
    }
  },
  data: function() {
    return {
      isLoading: false,
      errorMessages: [],
      formData: JSON.parse(JSON.stringify(FORM_DATA_INIT))
    }
  },
  computed: {
    rules: () => rules
  },
  watch: {
    record: function(val) {

      if(val) {
        const filePathSplit = val['importedFilePath'].split("\\")
        this.formData = {
          attachedFile: {
            name: filePathSplit[filePathSplit.length - 1] ,
            path: val['importedFilePath']
          },
          tableName: val['logicalTableName'],
          description: val['description'],

        }
      } else {
        this.formData = JSON.parse(JSON.stringify(FORM_DATA_INIT))
      }
    },

  },
  methods: {
    handleSubmit: async function() {
      this.errorMessages = []
      const objImportedTable = await checkTableNameImportedTable(this.formData.tableName);
      if(!!!objImportedTable || this.record?.id === objImportedTable.dataValues.id) {
        if(!!this.record) {
          this.updateImportedTableData()
        } else {
          this.createNewImportedTableData()
        }
      }else{
          message.error("Table Name already exists. Please input source data again !");
      }
    },

    createNewImportedTableData: async function() {
      try {
        await this.$refs['formRef'].validate()
        this.isLoading = true
        await createImportedTableData(this.formData.attachedFile.path, this.formData.tableName, this.formData.description)
        message.success("Import data successful")
        this.resetForm()
        this.$emit('success')
      } catch (error) {
        console.log(error)
        if(error.type === 'SHEET_INVALID') {
          this.errorMessages = error.messages
        }
        message.error("Import data failed")
      } finally {
        this.isLoading = false
      }
    },

    updateImportedTableData: async function() {
       try {
        await this.$refs['formRef'].validate()
        this.isLoading = true
        await updateImportedTable(this.record.id, {
          logicalTableName: this.formData.tableName,
          description: this.formData.description
        })
        message.success("Update successful")
        this.resetForm()

        this.$emit('success')
        
      } catch (error) {
        message.error("Update failed")
      } finally {
        this.isLoading = false
      }
    },

    resetForm: function() {
      this.errorMessages = []
      this.$refs['formRef'].clearValidate();
      this.formData = JSON.parse(JSON.stringify(FORM_DATA_INIT))
    },

    clearValidate: function() {
      this.$refs['formRef'].clearValidate();
    },

    handleCloseDialog: function() {
      this.resetForm()
      this.$emit('close')
    }
  },
};
</script>
