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
          <li v-for="(errorMessage, key) in errorMessages" :key="key">
            {{ errorMessage }}
          </li>
        </ol>
      </template>
    </a-alert>

    <a-form
      ref="formRef"
      :model="formData"
      layout="vertical"
      label-align="right"
      @submit="handleSubmit"
    >
      <a-form-item label="Data File" name="attachedFiles">
        <div style="display: flex">
          <UploaderMultiple
            v-model:attached-files="formData.attachedFiles"
            :disabled="!!record || isLoading"
          />
        </div>
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
import { message } from "ant-design-vue";
import {
  checkTableNameImportedTable,
  createImportedTableData,
  updateImportedTable,
  validateFileData,
} from "@/services/datatable";

import UploaderMultiple from "./UploadMulti.vue";

const FORM_DATA_INIT = {
  attachedFiles: [],
  attachedFileName: "",
  tableName: "",
  description: "",
};

const rules = {
  attachedFiles: [
    { required: false, message: "Required", trigger: "change", type: "array" },
  ],
};

export default {
  components: { UploaderMultiple },
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    // if open form with new form -> record = null
    record: {
      type: Object,
      default: () => null,
    },
  },
  data: function () {
    return {
      isLoading: false,
      errorMessages: [],
      formData: JSON.parse(JSON.stringify(FORM_DATA_INIT)),
      tableImports: [],
    };
  },
  computed: {
    rules: () => rules,
  },
  watch: {
    record: function (val) {
      if (val) {
        const filePathSplit = val["importedFilePath"].split("\\");
        this.formData = {
          attachedFiles: {
            name: filePathSplit[filePathSplit.length - 1],
            path: val["importedFilePath"],
          },
          tableName: val["logicalTableName"],
          description: val["description"],
        };
      } else {
        this.formData = JSON.parse(JSON.stringify(FORM_DATA_INIT));
      }
    },
  },
  methods: {
    handleSubmit: async function () {
      let that = this;
      this.isLoading = true;
      this.errorMessages = [];
      const elements = this.formData.attachedFiles;
      for (let i = 0; i < elements.length; i++) {
        // let nameTable = element.name.split(".")[0];
        let nameTable = elements[i].name.split(".")[0];

        let fileInput = {
          attachedFile: elements[i],
          //   tableName: nameTable.split("_")[nameTable.split("_").length - 1],
          tableName: nameTable,
          description: that.formData.description,
        };

        const objImportedTable = await checkTableNameImportedTable(
          fileInput.tableName
        );
        if (!!!objImportedTable) {
          this.isLoading = true;
          try {
            const validate = await validateFileData(
              fileInput.attachedFile.path
            );
            if (validate.length > 0)
              this.errorMessages.push(
                "Table " + fileInput.tableName + validate
              );
          } catch (error) {
            console.log(error);
          } finally {
            this.isLoading = false;
          }
          this.tableImports.push(fileInput);
          // await this.createNewImportedTableData(fileInput);
        } else {
          this.errorMessages.push(
            "Table " +
              fileInput.tableName +
              " already exists. Please input source data again !"
          );
          // message.error(
          //   "Table " +
          //     fileInput.tableName +
          //     " already exists. Please input source data again !"
          // );
        }
      }

      if (this.errorMessages.length == 0) {
        try {
          this.isLoading = true;
          for (let item of this.tableImports) {
            await this.createNewImportedTableData(item);
          }
        } catch (error) {
          console.log(error);
        } finally {
          this.isLoading = false;
        }

        this.$emit("success");
        this.resetForm();
      } 

      this.isLoading = false;

    },

    createNewImportedTableData: async function (input) {
      try {
        await this.$refs["formRef"].validate();
        this.isLoading = true;
        await createImportedTableData(
          input.attachedFile.path,
          input.tableName,
          input.description
        );
        message.success("Import data successful");
      } catch (error) {
        console.log(error);
        // if (error.type === "SHEET_INVALID") {
        //   this.errorMessages.push(
        //     "Table " + input.tableName + " " + error.messages
        //   );
        // }
        // message.error("Import data failed");
      } finally {
        this.isLoading = false;
      }
    },

    updateImportedTableData: async function () {
      try {
        await this.$refs["formRef"].validate();
        this.isLoading = true;
        await updateImportedTable(this.record.id, {
          logicalTableName: this.formData.tableName,
          description: this.formData.description,
        });
        message.success("Update successful");
        this.resetForm();

        this.$emit("success");
      } catch (error) {
        message.error("Update failed");
      } finally {
        this.isLoading = false;
      }
    },

    resetForm: function () {
      this.errorMessages = [];
      this.$refs["formRef"].clearValidate();
      this.formData = JSON.parse(JSON.stringify(FORM_DATA_INIT));
    },

    clearValidate: function () {
      this.$refs["formRef"].clearValidate();
    },

    handleCloseDialog: function () {
      this.resetForm();
      this.$emit("close");
    },
  },
};
</script>