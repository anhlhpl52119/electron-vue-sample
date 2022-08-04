<template>
  <a-form
    :model="formState"
    name="basic"
    layout="vertical"
    autocomplete="off"
    class="form"
  >
    <a-form-item style="display: block">
      <div 
        style="float: right;" 
      >
        <a-button
          style="margin-left: 2px; margin-right: 2px;"
          type="primary"
          :loading="isExporting"
          @click="handleExportData"
        >
          Export
        </a-button>
      </div>
    </a-form-item>

    


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
      label="MC Template" 
      name="mcTemplatePath"
    >
      <TemplateFileSelect
        v-model:value="formState.mcTemplatePath"
        @change="handleTemplateFileChange"
      />
    </a-form-item>

      

    <div
      v-if="formState.templateMappingSheets"
      style="display: flex; flex-direction: column; flex-wrap: nowrap; align-items: stretch; flex: 1; overflow-y: auto;"
    > 
      <a-typography-title
        style="text-align: center"
        :level="5"
      >
        Template Mapping
      </a-typography-title>

      <a-input-search
        v-model:value="treeNodeSearch"
        style="margin-bottom: 8px"
        placeholder="Search"
      />
      
      <div style="display: flex; width: 100%; justify-content: space-between; border: 1px solid #dcdcdc;">
        <a-typography-title
          style="text-align: center; margin-left: 25px"
          :level="5"
        > 
          Template
        </a-typography-title>

        <span>
          <a-typography-title
            style="text-align: center; margin-right: 25px;"
            :level="5"
          >
            Datasource
          </a-typography-title>
        </span>
      </div>

      <div class="tree-menu-container">
        <a-tree
          v-model:selected-keys="selectedKeys"
          v-model:expanded-keys="expandedKeys"
          :tree-data="templateTreeData"
          show-icon
          :show-line="true"
          class="tree-menu"
        >
          <template #switcherIcon>
            <DownOutlined />
          </template>
    
          <template #sheet="item">
            <div
              style="display: flex; justify-content: space-between; "
              class="tree-item-container"
            >
              <span style="margin-left: 5px">
                <b>
                  {{ item.title }} ( {{ item.mappedFieldCount }} / {{ item.data.fields.length }} )
                </b>
              </span>

              <a-select
                style="width: 120px"
                show-search
                size="small"
                :allow-clear="true"
                :value="item.data.queryTable"
                :options="queryTablesSelectOption"
                @change="(e) => handleSheetMappingChange(item, e)"
              />
            </div>
          </template>

          <template #fieldSwitcherIcon="item">
            <KeyOutlined v-if="item.data?.attr?.groupName === 'Key'" />
            <NumberOutlined v-else />
          </template>

          <template #field="item">
            <div
              style="display: flex; justify-content: space-between "
            >
              <span>
                <span v-if="item.title.toLowerCase().indexOf(treeNodeSearch.toLowerCase()) > -1">
                  <span>
                    {{ item.title.substr(0, item.title.toLowerCase().indexOf(treeNodeSearch.toLowerCase())) }}
                  </span>
                  <span style="background: #ffff00">
                    {{ item.title.substr(item.title.toLowerCase().indexOf(treeNodeSearch.toLowerCase()), treeNodeSearch.length) }}
                  </span>
                  <span>
                    {{ item.title.substr(item.title.toLowerCase().indexOf(treeNodeSearch.toLowerCase()) + treeNodeSearch.length) }}
                  </span>
                </span>

                <span
                  v-if="item.data?.attr?.mandatory"
                  style="color: red"
                > *</span>

              </span>

              <a-select 
                v-if="item.selected"
                style="width: 100px"
                show-search
                size="small"
                :allow-clear="true"
                :value="item.data.queryField"
                :options="(tableFieldsDictSelectOption[item.queryTable] || [])"
                @change="(e) => handleFieldMappingChange(item, e)"
                @click="e => e.stopPropagation()"
              />
              <span v-else>
                {{ item.data.queryField || '-' }}
              </span>
            </div>
          </template>
        </a-tree>
      </div>
    </div>
  </a-form>
</template>

<script>
import McTemplateExporterService from "@/services/mc_template_exporter"

import TemplateFileSelect from "./TemplateFileSelect.vue"
import McTemplateService from "@/services/mc_template"

import { NAMESPACE } from "@/views/pages/Flowchart/store"
import { mapState, mapMutations, mapGetters } from "vuex" 

import { DownOutlined, KeyOutlined, NumberOutlined} from '@ant-design/icons-vue';
const { dialog } = require('@electron/remote')

let treeDataTimeoutId = null

export default {
  components: {
    TemplateFileSelect,
    DownOutlined,
    KeyOutlined,
    NumberOutlined
  },


  data() {
    return {
      formState: {
        code: "",
        mcTemplatePath: "",
        templateMappingSheets: [],
      },
      expandedKeys: [],
      selectedKeys: [],
      templateTreeData: [],
      treeNodeSearch: "",
      isExporting: false
    }
  },

  computed: {
    ...mapState(`${NAMESPACE}/GRAPH`, {
      graph: ({graph}) => graph,
    }),
    
    ...mapGetters(`${NAMESPACE}/GRAPH`, [
      'selectedNode',
      'nearestSourceNodes'
    ]),

    queryTablesSelectOption() {
      if(!this.nearestSourceNodes) return []
      return this.nearestSourceNodes.map(node => ({
        label: node.data.code,
        value: node.data.code
      }) )
    },

    tableFieldsDictSelectOption() {
      if(!this.nearestSourceNodes) return {}
      return this.nearestSourceNodes.reduce((result, node) => {
        const { code, select } = node.data
        result[code] = select.map(field => ({
          label: field['alias'],
          value: field['alias']
        }))
        return result
      }, {})
    }
  },

  watch: {
    selectedNode(val) {
      if(val) {
        this.initFormData()
      }
    },
    "formState.templateMappingSheets": {
      handler: function() {
        this.setTemplateTreeData()
      },
      deep: true
    },

    treeNodeSearch(newVal, oldVal) {
      clearTimeout(treeDataTimeoutId)
      treeDataTimeoutId = setTimeout(()=>{
        this.setTemplateTreeData()
        if(newVal.length > oldVal.length) {
          this.expandedKeys = this.templateTreeData.map(e => e.key)
        }
      },100)
    },
    "formState": {
      handler: function() {
        this.updateNodeData({
          nodeId: this.selectedNode.id, 
          data: {
            ...this.selectedNode.data,
            ...this.formState
          }
        })
      },
      deep: true
    }
  },

  created() {
    this.initFormData()
    
  },

  methods: {
    ...mapMutations(`${NAMESPACE}/GRAPH`, [
      'updateNodeData'
    ]),
    
    setTemplateTreeData() {
      if(!this.formState.templateMappingSheets) return []
      const templateTree = this.formState.templateMappingSheets.map(templateMappingSheet => {
        const { fields } = templateMappingSheet
        return {
          title: templateMappingSheet.templateSheet,
          slots: {
            title: "sheet"
          },
          key: templateMappingSheet.templateSheet,
          data: templateMappingSheet,
          mappedFieldCount: fields.filter(field => field.queryField !== "").length,
          children: fields.map(field => {
            const { templateField, attr} = field
            return {
              slots: {
                title: "field",
                switcherIcon: "fieldSwitcherIcon"

              },
              title: `${attr.fieldDescr} (${templateField})`,
              key: templateMappingSheet.templateSheet + "-" + templateField,
              // isLeaf: true,
              data: field,
              queryTable: templateMappingSheet.queryTable
            }
          }).filter(treeField => { // filter search
            return treeField.title.toLowerCase().indexOf(this.treeNodeSearch.toLowerCase()) > -1
          })
        }
      }).filter(treeSheet => { // filter search
        return treeSheet.children.length > 0
      })

      this.templateTreeData = templateTree
      console.log(this.templateTreeData)
    },

    handleTemplateFileChange(filePath) {
      const templateStructure = McTemplateService.loadMCTemplate(filePath)
      this.formState.templateMappingSheets = templateStructure['sheets'].map((sheet) => {
        const { name, fields } = sheet
        return {
          templateSheet : name,
          queryTable: "",
          fields: fields.map(field => ({
            attr: field,
            templateSheet: name,    
            templateField: field.sapField,
            queryField: ""
          }))
        }
      })


    },

    initFormData() {
      const data = this.selectedNode.data
      if(data) {
        const { code, mcTemplatePath, templateMappingSheets } = JSON.parse(JSON.stringify(this.selectedNode.data))
        this.formState = {
          ...this.formState,
          code,
          mcTemplatePath,
          templateMappingSheets
        }
      }
    },

    async handleExportData() {
      const dialogOption = {
          defaultPath: `${this.selectedNode.data.code}_${Date.now()}.xml`,
          filters: [
            {name: 'xml', extensions: ['xml']},
            { name: 'All Files', extensions: ['*'] }
          ]
        }

        const userChosen = await dialog.showSaveDialog(dialogOption);
        if(!userChosen.canceled) {
          
          const { filePath } = userChosen
          try {
            this.isExporting = true
            await McTemplateExporterService.executeExportDataToTemplate(filePath, this.selectedNode.data.mcTemplatePath, this.selectedNode.data, this.graph)
            this.$message.success(`Exporting file to ${filePath} successfully!`)
          
          } catch (error) {
            this.$message.error(`Someting wrong`)
            console.error(error)
            
          } finally {
            this.isExporting = false

          }
        }
    },

    handleSheetMappingChange(sheetItem, queryTableName) {
      const templateMappingSheet = this.formState.templateMappingSheets.find(templateMappingSheet => templateMappingSheet.templateSheet === sheetItem.data.templateSheet)
      
      if(templateMappingSheet) {
        templateMappingSheet.queryTable = queryTableName
        templateMappingSheet.fields = templateMappingSheet.fields.map( field => ({
          ...field,
          queryField: ""
        }))
      }
    },

    handleFieldMappingChange(item, val) {
      let templateMappingSheet = this.formState.templateMappingSheets.find(
          templateMappingSheet => templateMappingSheet.templateSheet === item.data.templateSheet
      )

      let templateMappingField = templateMappingSheet.fields.find(
        field => field.templateField === item.data.templateField
      )
      
      templateMappingField.queryField = val
    
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

<style lang="scss" scoped>
.form {
  max-height: 100%;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: stretch;
}

.tree-menu-container {
  // background: red;
  border: 1px solid #dcdcdc;
  
  flex: 1;
  overflow-y: auto;

}

.tree-menu {
  width: 100%;
  padding-right: 5px;

  :deep() .ant-tree-node-content-wrapper {
    padding: 0px;
    width: calc(100% - 24px);
    height: auto;
  }

  .tree-item-container {
    &.error{
      border: 1px solid red;

    }

  }
}
</style>