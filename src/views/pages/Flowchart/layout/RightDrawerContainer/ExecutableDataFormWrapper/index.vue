<template>
  <a-tabs
    v-model:activeKey="selectedTab"
    type="card"
    size="large"
    class="tabs-container"
  >
    <a-tab-pane
      :key="TABS.FORM_TAB"
      tab="Form"
    >
      <DataTableForm
        v-if="selectedNode && selectedNode?.data?.type === NODE_TYPE.TABLE"
        :selected-node="selectedNode"
        :imported-tables="importedTables"
        @change="handleNodeDataFormChange"
      />
      <QueryBuilderForm 
        v-if="selectedNode && selectedNode?.data?.type === NODE_TYPE.QUERY"
        :selected-node="selectedNode"
        :nearest-source-nodes="nearestSourceNodes"
        @change="handleNodeDataFormChange"
      />
    </a-tab-pane>
    <a-tab-pane
      :key="TABS.SAMPLE_DATA_TAB"
      tab="Data"
    >
      <SampleDataForm
        :sql="sql"
      />
    </a-tab-pane>
  </a-tabs>
</template>

<script>
import DataTableForm from "../../../components/DataTableForm"
import SampleDataForm from "../../../components/SampleDataForm"
import QueryBuilderForm from "../../../components/QueryBuilderForm"

import Constants from "@/constants/index"

import GraphService from "@/services/graph"
import SqlGeneratorService from "@/services/sql_generator"

import { NAMESPACE } from "@/views/pages/Flowchart/store"
import { mapState, mapMutations, mapGetters} from "vuex" 

const { NODE_CONSTANT } = Constants

const TABS = {
  FORM_TAB: "FORM_TAB", 
  SAMPLE_DATA_TAB: "SAMPLE_DATA_TAB"
}

export default {
  components: {
    DataTableForm,
    SampleDataForm,
    QueryBuilderForm
  },


  data() {
    return {
      selectedTab: TABS.FORM_TAB,
      connectedNodes: [],
      sql: ""
    }
  },
  computed: {
    ...mapState(`${NAMESPACE}/GRAPH`, {
      graph: ({graph}) => graph
    }),

    ...mapGetters(`${NAMESPACE}/GRAPH`, [
      'selectedNode',
      'nearestSourceNodes'
    ]),

    ...mapState(`${NAMESPACE}/MASTER_DATA`, {
      importedTables: state => state.importedTables
    }),

    NODE_TYPE: () => NODE_CONSTANT.TYPE,
    TABS: () => TABS
  },


  watch: {
    async selectedNode( node ) {
      if(node) {
        this.connectedNodes = GraphService.getNearestSourceNodesByGraph(this.selectedNode, this.graph)
        if(this.selectedTab === TABS.SAMPLE_DATA_TAB) {
          await this.generateSql()
        }
      }
    },

    async selectedTab() {
      if(this.selectedTab === TABS.SAMPLE_DATA_TAB) {
        await this.generateSql()
      }
    }
  },
  async created() {
    this.connectedNodes = GraphService.getNearestSourceNodesByGraph(this.selectedNode, this.graph)

  },

  methods: {
    ...mapMutations(`${NAMESPACE}/GRAPH`, [
      'updateNodeData'
    ]),

    handleNodeDataFormChange(dataForm) {
      this.updateNodeData({
        nodeId: this.selectedNode.id, 
        data: dataForm
      })
    },

    handleSubmitForm(dataForm) {
      this.updateNodeData({
        nodeId: this.selectedNode.id, 
        data: dataForm
      })
    },

    async generateSql() {
      const data = this.selectedNode?.data
      let executableSql = ""
      if(data) {
        
        try {
          const nodeDict = {
            id: this.selectedNode.id,
            data: data
          }
          executableSql = await SqlGeneratorService.generateFullSql(nodeDict, this.graph)

        } catch (error) {
          console.error("error", error)
        }
        
      } 
      this.sql = executableSql
    }
  },

}
</script>