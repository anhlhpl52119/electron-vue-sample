<template>
  <div style="width: 100%; display: flex">
    <input
      ref="excel-upload-input"
      style="display: none"
      type="file"
      accept=".xlsx, .xls, .csv"
      @change="handleUploadFileInputChanged"
      multiple
    />

    <!-- <a-tooltip placement="top">
      <template #title>
        <span v-for="(file, index) in attachedFile" :key="index">{{
          file.path + "\n"
        }}</span>
      </template> -->
    <!-- <a-textarea readonly :value="attachedFile[0]?.name" :rows="4" /> -->

    <a-textarea
      readonly
      :rows="4"
      :value="attachedFiles.map((item) => item.name).join('\n')"
    >
      <!-- {{file.name}} -->
    </a-textarea>
    <!-- </a-tooltip> -->

    <a-button
      style="margin-left: 16px"
      size="mini"
      type="primary"
      :disabled="disabled"
      @click="handleBrowseButtonClicked"
    >
      Browse
    </a-button>
  </div>
</template>
<script>
export default {
  props: {
    attachedFiles: {
      type: Array,
      default: () => [],
    },
    disabled: {
      type: Boolean,
      default: () => false,
    },
  },
  watch: {
    attachedFiles: function (val) {
      if (!val) {
        this.$refs["excel-upload-input"].value = "";
      }
    },
  },
  methods: {
    handleBrowseButtonClicked: function () {
      this.$refs["excel-upload-input"].click();
    },

    handleUploadFileInputChanged: function (e) {
     
      this.$emit("update:attachedFiles", Object.values(e.target.files));
    },
  },
};
</script>