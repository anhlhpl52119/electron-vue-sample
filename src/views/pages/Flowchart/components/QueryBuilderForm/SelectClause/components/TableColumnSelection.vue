<template>
  <div class="tree-menu-container">
    <a-input-search
      v-model:value="treeNodeSearchInput"
      style="margin: 8px 0 8px 0"
      placeholder="Search"
    />

    <div style="display: flex; width: 100%; justify-content: space-between; border: 1px solid #dcdcdc;">
      <a-typography-title
        style="text-align: center; margin-left: 15px;"
        class="mb-0"
        :level="5"
      > 
        Datasource
      </a-typography-title>

      <span>
        <a-typography-title
          style="text-align: center; margin-right: 15px;"
          class="mb-0"
          :level="5"
        >
          Alias
        </a-typography-title>
      </span>
    </div>

    <a-tree
      v-model:expandedKeys="expandedKeys"
      v-model:selectedKeys="selectedKeys"
      :checked-keys="checkedFields"
      checkable
      show-line
      :tree-data="treeData"
      class="tree-menu"
      @check="handleCheck"
      @select="handleSelect"
    >
      <template #switcherIcon>
        <DownOutlined />
      </template>

      <template #parent="item">
        {{ item.title }}
        <span> ({{ item.checkedItemCount }}/{{ item.children.length }}) </span>
      </template>


      <template #fieldSwitcherIcon>
        <NumberOutlined />
      </template>
      <template #child="item">
        <div
          :class="`tree-item-container ${item.isShow || 'hide'}`"
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

          </span>
          
          <a-input
            v-if="item.selected && item.checked"
            ref="aliasInput"
            size="small"
            style="width: 150px"
            :value="selectedAliasInput"
            @change="e => handleColumnAliasChange(item, e)"
            @click="e => e.stopPropagation()"
          />

          <span v-else>{{ item['alias'] }}</span>
        </div>
      </template>
    </a-tree>
  </div>
</template>
<script>



import CONSTANTS from "@/constants/index"
const { QUERY_CONSTANT } = CONSTANTS
import { DownOutlined, KeyOutlined, NumberOutlined} from '@ant-design/icons-vue';

let tableAliasChangeTimeOut = 0
let treeDataTimeoutId = 0
export default {
  components: {DownOutlined, NumberOutlined},
  props: {
    value: {
      type: Array,
      default: _ => []
    },
    chosenNodeDatas: {
      type: Array,
      default: _ => []
    },
  },
  emits: ["change"],
  data: function () {
    return {
      expandedKeys: [],
      selectedKeys: [],
      checkedKeys: [],
      selectedAliasInput: "",
      treeNodeSearch: "",
      treeNodeSearchInput: ""
    };
  },
  computed: {


    treeData: function() {
      return this.chosenNodeDatas.map((nodeData) => {
        const {code, select} = nodeData
        let checkedItemCount = 0
        const children = select.map(e => {
          const generatedKey = `column-${code}-${e["alias"]}`
          const matchedColumn = this.valueDict[generatedKey]
         if(matchedColumn) checkedItemCount++ 
          const isShow = e['alias'].toLowerCase().indexOf(this.treeNodeSearch.toLowerCase()) > -1
          return {
            title: e['alias'],
            alias: matchedColumn ? matchedColumn['alias'] : e['alias'],
            key: generatedKey,
            data: e,
            parent: nodeData,
            slots: {
              title: "child",
              switcherIcon: "fieldSwitcherIcon"
            },
            style: {display: isShow ? 'block' : 'none'}
          }
        })

        return {
          title: code,
          data: nodeData,
          key: `table-${code}`,
          checkedItemCount: checkedItemCount,
          slots: {
            title: "parent",

          },
          children: children
        }
      })
    },

    checkedFields() {
      return Object.keys(this.valueDict)
    },

    valueDict() {
      return this.value.reduce((result, column) => {
        const { field, table} = column
        const key = `column-${table}-${field}`
        result[key] = column
        return result
      }, {})
    },


  },

    watch: {
      treeNodeSearchInput(newVal, oldVal) {
        clearTimeout(treeDataTimeoutId)
        treeDataTimeoutId = setTimeout(()=>{
          this.treeNodeSearch = newVal
          if(newVal.length > oldVal.length) {
            this.expandedKeys = this.treeData.map(e => e.key)
          }
        },100)
        
    },
},

  methods: {
    handleCheck(checkedKeys, e) {

      const { children} = e.node.dataRef
      const checked = e.checked
      const isParentNode = e.node.dataRef.key.startsWith("table-")

      let value = []
      if(checked) {
        let affectColumns = []
        if(isParentNode) {
          affectColumns = children.map(childNode => ({
            table: e.node.dataRef.data['code'],
            field: childNode.data['alias'],
            alias: childNode.data['alias'],
            type: QUERY_CONSTANT.SELECT.TYPE.TABLE_FIELD
          }))

        } else {

          affectColumns = [{
            table: e.node.dataRef.parent['code'],
            field: e.node.dataRef.data['alias'],
            alias: e.node.dataRef.data['alias'],
            type: QUERY_CONSTANT.SELECT.TYPE.TABLE_FIELD
          }]

        }
        
        value = [
          ...this.value, 
          ...affectColumns
        ]

      } else {
        
        let affectColumnKeys = []
        if(isParentNode) {
          affectColumnKeys = children.map(childNode => childNode.key )
        } else {
          affectColumnKeys = [e.node.dataRef.key]
        }

        const filteredValueDict = affectColumnKeys.reduce((result, key) => {
          delete result[key]
          return result
        }, this.valueDict)

        value = Object.keys(filteredValueDict).map(key => filteredValueDict[key])
      }

      this.$emit('change', value)
    },

    handleColumnAliasChange(item, e) {
      const val = e.target.value
      this.selectedAliasInput = val
      const key = item.key

      clearTimeout(tableAliasChangeTimeOut)

      tableAliasChangeTimeOut = setTimeout(() => {
        const newValueDict = {
          ...this.valueDict,
          [key]: {
            ...this.valueDict[key],
            alias: val
          }
        }
        const value = Object.keys(newValueDict).map(key => newValueDict[key])

        this.$emit('change', value)
      }, 30)
      
  
    },

    handleSelect(key, e) {
      const isParentNode = e.node.dataRef.key.startsWith("table-")

      if(!isParentNode) {
        if(e.selected) {
          this.selectedAliasInput = e.node.dataRef['alias']
          this.$nextTick(() => this.$refs['aliasInput'].focus())
        }
      }

    },


  },
};
</script>
<style lang="scss" scoped>
.inner-right {
  max-height: 180px;
  height: 180px;
  overflow-y: scroll;
  overflow-x: hidden;
}


.tree-menu-container {
  // background: red;
  flex: 1;
  overflow-y: auto;

}

.tree-menu {
  overflow: auto;
  max-height: 800px;
  border: 1px solid #dcdcdc;
  width: 100%;
  padding-right: 5px;

  :deep() .ant-tree-node-content-wrapper {
    padding: 0px;
    width: calc(100% - 48px);
    height: auto;
  }

  .tree-item-container {
    display: flex; 
    justify-content: space-between; 

    &.error{
      border: 1px solid red;

    }


  }

}

.mb-0 {
  margin-bottom: 0 !important;
}
</style>
