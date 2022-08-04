<template>
  <div class="wrapper">
    <a-tooltip placement="top">
      <template #title>
        <span>{{ value }}</span>
      </template>
      <a-input
        :value="value"
        disabled
        class="uneditable-input"
        :style="`width: calc(100% - ${buttonText.length+80}px ) `"
      />
    </a-tooltip>

    <a-button @click="handleSelectFileClick">
      {{ buttonText }}
    </a-button>
  </div>
</template>

<script>
const { dialog } = require('@electron/remote')

export default {
  props: {
    buttonText: {
      type: String,
      default: 'Browse'
    },
    value: {
      type: String,
      default: ""
    }
  },
  
  emits: ['update:value', 'change'],
  
  methods: {
    async handleSelectFileClick() {
      const dialogOption = {
        properties: ['openFile'] ,
        filters: [
          {name: 'xml', extensions: ['xml','XML']},
          { name: 'All Files', extensions: ['*'] }
        ]
      }

      const userChosen = await dialog.showOpenDialog(dialogOption)
      if(!userChosen.canceled) {
        const {filePaths} = userChosen
        if(filePaths.length > 0) {
          const selectedFilePath = filePaths[0]
          if(selectedFilePath !== this.value) {
            this.$emit("update:value", selectedFilePath)
            
            this.$emit("change", selectedFilePath)
          } 
        
        }
      }
      
    }
  }
}
</script>


<style lang="scss" scoped>
.uneditable-input {
  cursor: auto;
  color: #000;
  
  margin-right: 5px;
}
.wrapper {
  display: flex
}
</style>

{
  templateFilePath: "",
  sheetMappings: [
    {
      name: "",
      code: ""
    }
  ]
}