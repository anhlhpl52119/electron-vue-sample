<template>
  <div style="width: 100%; display: flex">
    <input
      ref="excel-upload-input"
      style="display: none"
      type="file"
      accept=".xlsx, .xls, .csv"
      @change="handleUploadFileInputChanged"
    >

    <a-tooltip placement="top">
      <template #title>
        <span>{{ attachedFile?.path }}</span>
      </template>
      <a-input
        readonly
        :value="attachedFile?.name"
      />
    </a-tooltip>


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
    attachedFile: {
      type: Object,
      default: () => null
    },
    disabled: {
      type: Boolean,
      default: () => false
    }
  },
  watch: {
    attachedFile: function(val) {
      if(!val) {
        this.$refs['excel-upload-input'].value = ''
      }
    }
  },
  methods: {
    handleBrowseButtonClicked: function() {
      this.$refs['excel-upload-input'].click()
    },

    handleUploadFileInputChanged: function(e) {
      this.$emit('update:attachedFile', e.target.files[0])

    },
  },
};
</script>
