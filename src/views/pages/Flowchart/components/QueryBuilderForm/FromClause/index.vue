<template>
  <a-col :span="8">
    <h4>Main Table</h4>
    <a-select
      :value="valueFrom.code"
      style="width: 100%"
      placeholder="Select main table"
      :options="dataTableOptions"
      @change="handleMainTableChange"
    />
  </a-col>
  <div
    v-for="(table) in joinStatements"
    :key="table.id"
  >
    <div class="wrap-border">
      <JoinConditionAdding
        :value="table.data"
        :joinable-table-options="joinableTableOptions"
        :main-table="mainTable || {}"
        :node-connected-structure="nodeConnectedStructure"
        @remove="_ => handleRemoveJoinCondition(table.id)"
        @change="(data) => handleJoinTableChange(table.id, data)"
      />
    </div>
  </div>
  <div>
    <a-button
      type="primary"
      style="margin-top: 5px"
      shape="circle"
      :disabled="!valueFrom.code"
      @click="handleAddNewJoinStatementClick"
    >
      <PlusOutlined />
    </a-button>
  </div>
</template>
<script>
import JoinConditionAdding from "./components/JoinConditionAdding";
import { v4 as uuidv4 } from 'uuid';
import { PlusOutlined } from '@ant-design/icons-vue';
import CONSTANTS from "@/constants"

const { QUERY_CONSTANT } = CONSTANTS
export default {
  components: {
    JoinConditionAdding,
    PlusOutlined
  },
  props: {
    nodeConnectedStructure: {
      type: Array,
      default: _ => [],
    },

    valueFrom: {
      type: Object,
      default: _ => ({})
    },

    valueJoin: {
      type: Object,
      default: _ => ({})
    },

    connectedSourceNodes: {
      type: Array,
      default: _ => []
    }
  },
  emits: ["from-clause-change", 'output-from-structure', 'main-table-change', 'join-table-change'],
  data: function () {
    return {
      joinStatements: [],
      temporaryJoinStaments: []
    };
  },
  computed: {
    selectedMainNodeData() {
      return this.connectedSourceNodes.find(node => node.data.code === this.valueFrom.code)
    },
    mainTable: function() {
      const result = this.nodeConnectedStructure.find((table) => {
        return table.title === this.valueFrom.code;
      });
      return result
    },

    dataTableOptions: function() {
      return this.connectedSourceNodes.map(node => {
        return {
          title: node.data.code,
          value: node.data.code,
        } 
      })
    },
    joinableTableOptions: function() {
      return this.connectedSourceNodes.reduce( (result, node) => {
        
        const obj = {
          title: node.data.code,
          value: node.data.code,
        }

        if(node.data.code === this.valueFrom.code
          || this.valueJoin.sources.find(joinSource =>  joinSource.code === node.data.code) ) {

          obj['disabled'] = true
        }

        result.push(obj)

        return result
      }, [])
    },
  },
  watch: {
    valueJoin: {
      deep: true,
      immediate: true,
      handler() {
        this.joinStatements = this.valueJoin.sources.map(source => ({
          id: uuidv4(),
          data: source
        }))
      }
    }
  },

  methods: {
    handleAddNewJoinStatementClick: function () {
      this.joinStatements = [...this.joinStatements, {
        id: uuidv4(),
        data: {
          code: '',
          on: [],
          type: QUERY_CONSTANT.JOIN.JOIN_TYPE.INNER_JOIN
        },
      }]

    },
    handleRemoveJoinCondition(id) {
      this.joinStatements = this.joinStatements.filter(e => e.id !== id)
      this.updateValueChange()
    },

    handleMainTableChange: function (mainTableVal) {
      this.$emit("main-table-change", mainTableVal)   
    },

    handleJoinTableChange(id, data) {
      const table = this.joinStatements.find(table => table.id === id)
      if(table) {
        table.data = data
      }

      this.updateValueChange()
    },

    updateValueChange() {
      const ouput = this.joinStatements.map(e => e.data)
      this.$emit("join-table-change", ouput)
    },
  },
};
</script>
<style scoped>
.wrap-border {
  border: 1px solid #9d9999;
  border-radius: 5px;
  background: rgb(250 250 250);
  margin: 5px;
}
</style>