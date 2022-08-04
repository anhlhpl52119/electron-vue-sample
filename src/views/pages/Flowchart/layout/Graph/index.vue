<template>
  <div style="width: 100%; height: 100%; position: relative">
    <div
      v-if="!selectedFlowDesignId"
      class="disabled-graph-layer"
    >
      No Flow Design has been selected !
    </div>

    <div id="container">
      <div style="display: flex; width: 100%; height: 100%; flex-direction: column">
        <ToolbarMenu 
          @data-table-click="handleToolbarDataTableModalClick"
          @export-click="handleToolbarMenuExportClick"
          @import-click="handleToolbarMenuImportClick"
        />
        <div
          id="graph-container"
          ref="graph-container"
        />
      </div>
      
      <Stencil
        :graph-instance="graphInstance"
      />
    </div>
    <DataTableModal
      width="80%"
      height="500px"
      :visible="dataTableModal.isOpen"
      @change="handleDataTableModalDataChange"
      @close="handleDataTableModalClose"
    />
  </div>
</template>

<script>
import "@antv/x6-vue-shape";
import Stencil from "./Stencil.vue";
import GraphConfig from "../../js/GraphConfig"

import ToolbarMenu from "../../components/ToolbarMenu"

import GraphService from "@/services/graph"

const { dialog } = require('@electron/remote')
import fs from "fs"

import CONSTANTS from "@/constants/index"

import {mapMutations, mapState, mapActions, mapGetters} from "vuex" 
import {NAMESPACE} from "@/views/pages/Flowchart/store" 

import DataTableModal from "../../components/DataTableModal"

const { NODE_CONSTANT } = CONSTANTS
let graphChangeTimeout = null

export default {
  components: {
    Stencil,
    ToolbarMenu,
    DataTableModal
  },
  data() {
    return {
      dataTableModal: {
        isOpen: false
      }
    }

  },
  computed: {
    ...mapState(`${NAMESPACE}/FLOW_DESIGN_MENU`, {
      selectedFlowDesignId: state => state.selectedFlowDesignId
    }),
    ...mapState(`${NAMESPACE}/GRAPH`, {
      graphInstance: (state) => state.graphInstance,
      graph: (state) => state.graph,
    }),
    ...mapGetters(`${NAMESPACE}/GRAPH`, [
      'selectedNode'
    ])
  },
  mounted() {
    this.initGraph();
    this.initEvent()
    this.initStencil()
  },
  methods: {
    ...mapActions(`${NAMESPACE}/FLOW_DESIGN_MENU`, [
      'saveFlowDesign',
    ]),
    ...mapMutations(`${NAMESPACE}/RIGHT_DRAWER`, {
      'showDetailDrawer': 'show',
      'hideDetailDrawer': 'hide',
  }),
    ...mapMutations(`${NAMESPACE}/GRAPH`, [
      'setSelectedNode',
      'setGraphInstance',
      'addNode',
      'removeNode',
      'addEdge',
      'removeEdge',
      'updateEdge',
      'updateNode'
    ]),
   ...mapActions(`${NAMESPACE}/MASTER_DATA`, [
     'loadImportedTables'
   ]),
   
    initGraph() {
      const graphInstance = GraphConfig.setupGraph(this.$refs['graph-container'])
      this.setGraphInstance(graphInstance)
    },

    initEvent() {
      
      
      this.graphInstance.on("node:change:position", (event) => {
        this.handleGraphChange()
      })

      this.graphInstance.on("node:change:size", (event) => {
        this.handleGraphChange()
      })

      this.graphInstance.on("node:click", (event) => {

        this.handleNodeClick(event)
      })

      this.graphInstance.on("node:mousenter", (event) => {
        this.handleNodeMouseEnter(event)
      })

      this.graphInstance.on("node:added", (event) => {
        this.handleNodeAdded(event)

        this.handleGraphChange()
      })

      this.graphInstance.on("node:removed", (event) => {
        this.removeNode(event.node.id)
        this.handleGraphChange()

      })

      this.graphInstance.on("node:change:data", (event) => {
        this.updateNode(event.node)
        this.handleNodeDataChange(event)
        this.handleGraphChange()
      })

      this.graphInstance.on("edge:connected", (event) => {
        if(this.validateAddedEdge(event)) {
          this.addEdge(event.edge)
          this.handleEdgeAdded(event)
          this.handleGraphChange()
        }
      })

      this.graphInstance.on("edge:removed", (event) => {
        this.removeEdge(event.edge.id)
        this.handleEdgeRemoved(event)
        this.handleGraphChange()
      })

      this.graphInstance.on("blank:click", (event) => {
        this.handleBlankClick(event)
      })
    },

    initStencil() {
      
    },

    handleNodeAdded(event) {
      const {node} = event
      const newCode = node.data['code'] + "_" + this.graphInstance.getNodes().length
      const newData = {
        ...node.data,
        code: newCode
      }
      node.setData(newData, {overwrite: true})

      this.addNode({
        id: node.id,
        data: newData
      })


    },


    handleEdgeAdded(event) {
     
    },

    handleEdgeRemoved(event) {
     
    },

    handleNodeDataChange(event) {
      if(event?.['node']?.['data']?.['code']) {
        const label = `${event['node']['data']['code']}`
        event.node.setAttrs({label: { text: label }})
      }
      switch(event['node']?.['data']?.['type']) {
        case NODE_CONSTANT.TYPE.TABLE: {
          const label = `${event['node']['data']['code']} (${event?.['node']?.['data']?.['from']?.['code'] || ''})`
          event.node.setAttrs({label: { text: label }})

          this.validateDataTableNode(event.node)
          break
        }
        case NODE_CONSTANT.TYPE.QUERY: {
          break
        }
        case NODE_CONSTANT.TYPE.QUERY: {
        }
      }
      
    },

    async handleNodeClick(event) {

      const edges = this.graphInstance.getEdges().map(edge => ({
        id: edge.id, 
        source:  edge.getSourceCellId(),
        target:  edge.getTargetCellId(),
      }))
      const nodes = this.graphInstance.getNodes().map(node => ({
        id: node.id,
        data: node.data
      }))

      this.highlightRelativeCells(event.node, nodes, edges)

      await this.updateSelectedNode(event.node)

    },

    handleBlankClick() {
      this.hideDetailDrawer()
    },

    async updateSelectedNode(node) {
      this.showDetailDrawer()
      this.setSelectedNode(node.id)


      this.bindOnceUnselectedNode(()=>{
        this.setSelectedNode(null)
        this.hideDetailDrawer()
      })
    },

    highlightRelativeCells(node) {
      const nodeDict = {
        id: node.id,
        data: node.data
      }
      const result = GraphService.getAdjSourceNodesTree(nodeDict, this.graph)
      const {affectEdges, affectNodes, tree} = result

      const affectedCellIds = [...affectEdges, ...affectNodes]
      const affectedCells = this.graphInstance.getCells().filter(cell => affectedCellIds.includes(cell.id))

      // highlight path when selected 
      this.graphInstance.findView(node).addClass('highlight')
      affectedCells.forEach(affectedCell => {
        const affectedCellView = this.graphInstance.findView(affectedCell)
        affectedCellView.addClass('highlight')
      })


      this.bindOnceUnselectedNode(() => {

        this.graphInstance.findView(node)?.removeClass('highlight')
        affectedCells.forEach(affectedCell => {
          const affectedCellView = this.graphInstance.findView(affectedCell)
          affectedCellView?.removeClass('highlight')
        })
      })
      
    },

  
    bindOnceUnselectedNode(callback){
      
      this.graphInstance.once("blank:mousedown", () => {
        callback()
      })

      this.graphInstance.once("blank:click", () => {
        callback()
      })

      this.graphInstance.once("cell:click", () => {
        callback()
      })

    },


    async handleToolbarMenuExportClick() {
      const json = this.graphInstance.toJSON()
      const jsonStr = JSON.stringify(json)

      const dialogOption = {
        defaultPath: `chart_${Date.now()}.json`,
        filters: [
          {name: 'json', extensions: ['json']},
          { name: 'All Files', extensions: ['*'] }
        ]
      }
      const userChosen = await dialog.showSaveDialog(dialogOption);
      if(!userChosen.canceled) {
        
        const { filePath } = userChosen
        
        let writeStream = fs.createWriteStream(filePath)
        writeStream.write(jsonStr)
        writeStream.end()

        await new Promise(resolve => writeStream.on("close", resolve))

        this.$message.success("Exporting file successfully!")
      }

    },
    
    async handleToolbarMenuImportClick() {
      const dialogOption = {
        properties: ['openFile'] ,
        filters: [
          {name: 'json', extensions: ['json']},
          { name: 'All Files', extensions: ['*'] }
        ]
      }

      const userChosen = await dialog.showOpenDialog(dialogOption)
      if(!userChosen.canceled) {
        const {filePaths} = userChosen
        if(filePaths.length > 0) {
          const selectedFilePath = filePaths[0]
          const readFileStream = fs.createReadStream(selectedFilePath)
          let chunks = []
          readFileStream.on('data', chunk => {
              chunks.push(chunk);
          });
          await new Promise( resolve => readFileStream.on('close', resolve));
          const dataStr = Buffer.concat(chunks).toString()
          try {
            this.graphInstance.fromJSON(JSON.parse(dataStr))
            this.$message.success("Importing file successfully!")
          } catch (error) {
            this.$message.error("Error!\r\n Importing file is not valid")
            
          }
        }
      }
    },

    unhighlightErrorCells(ids) {
      const cells = this.graphInstance.getCells().filter(cell => ids.includes(cell.id))
      cells.forEach(cell => {
        const cellView = this.graphInstance.findView(cell)
        cellView.removeClass('error')
      })
    },

    highlightErrorCells(cellIds) {
      
      const affectedCells = this.graphInstance.getCells().filter(cell => cellIds.includes(cell.id))

      // highlight path when selected 
      affectedCells.forEach(affectedCell => {
        const affectedCellView = this.graphInstance.findView(affectedCell)
        affectedCellView.addClass('error')
      })
    },

    validateAddedEdge(event) {
      const edges = this.graphInstance.getEdges().map(edge => ({
        id: edge.id, 
        source:  edge.getSourceCellId(),
        target:  edge.getTargetCellId(),
      }))
      const nodes = this.graphInstance.getNodes().map(node => ({
        id: node.id,
        data: node.data
      }))
      const isCyclic = GraphService.isExistCycle(nodes, edges)

      // validate cyclic graph
      if(isCyclic) {
        this.graphInstance.removeEdge(event.edge)
        this.$message.error("Can't create the connection, It cause a cyclic graph", 3)
        return false
      }

      // validate target node is a Table type
      const targetNode = event.edge.getTargetNode()
      const sourceNode = event.edge.getSourceNode()
      if(targetNode['data']['type'] === NODE_CONSTANT.TYPE.TABLE) {
        this.graphInstance.removeEdge(event.edge)
        return false
      }
      

      // template exporter node can not be lead to any node type
      if(sourceNode['data']['type'] === NODE_CONSTANT.TYPE.EXPORT_TO_TEMPLATE) {
        this.graphInstance.removeEdge(event.edge)
        return false
      }

      return true

    },

    validateGraph() {
      const edges = this.graphInstance.getEdges().map(edge => ({
        id: edge.id, 
        source:  edge.getSourceCellId(),
        target:  edge.getTargetCellId(),
      }))
      const nodes = this.graphInstance.getNodes().map(node => ({
        id: node.id,
        data: node.data
      }))

      this.unhighlightErrorCells(this.graphInstance.getCells().map(cell => cell.id))

      const cycles = GraphService.getCycles(nodes, edges)
      cycles.forEach(cycle => {
        const {nodeIds, edgeIds} = cycle
        this.highlightErrorCells([...nodeIds, ...edgeIds])

      })
      return cycles.length === 0
    },

    validateDataTableNode(node){
      const {data} = node
      let isValid = true
      if(!data['from'] || !data['from']?.['code'] ) {
        isValid = false
      }

      if( !data['code']) {
        isValid = false
      }

      // check code name of node is exists in graph
      if(this.graphInstance.getNodes().filter(node => node.data.code === data['code']).length > 1 ) {
        isValid = false
      }


      if(!isValid) {
        this.highlightErrorCells([node.id])
      } else {
        this.unhighlightErrorCells([node.id])
      }
      return isValid
    },

    handleGraphChange() {
      if(this.selectedFlowDesignId) {
        if(graphChangeTimeout) {
          clearTimeout(graphChangeTimeout)
        }
        graphChangeTimeout = setTimeout(() => {
          graphChangeTimeout = null
          this.$nextTick(_ => {
            this.saveFlowDesign({
              id: this.selectedFlowDesignId,
              diagramStructure: JSON.stringify(this.graphInstance.toJSON())
            })
          })
          
        }, 100)
      }
    },

    handleToolbarDataTableModalClick() {
      this.dataTableModal.isOpen = true
    },

    handleDataTableModalClose() {
      this.dataTableModal.isOpen = false

    },

    handleDataTableModalDataChange() {
      this.loadImportedTables()
    }
  },

};
</script>
<style lang="scss" scoped>
.disabled-graph-layer {
  position: absolute;
  background: #000;
  opacity: 0.5;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 99;


  color: #fff;
  display: flex;

 align-items: center;
 justify-content: center;
}

#container {
  height: 100%;
  width: 100%;
  display: flex;
  border: 1px solid #a8a8a8;
}



#graph-container:deep() {
  height: 100%;
  // width: 20%;
  // display: inline-block;
  // border: 1px solid #a8a8a8;
  // flex: 0 0 calc(100% - 240px - 240px);
  // flex-grow: 0;
  // flex-shrink: 0;
  flex-grow: 1;

  .x6-widget-transform {
    margin: -1px 0 0 -1px;
    padding: 0px;
    border: 1px solid #239edd;
  }
  .x6-widget-transform > div {
    border: 1px solid #239edd;
  }
  .x6-widget-transform > div:hover {
    background-color: #3dafe4;
  }
  .x6-widget-transform-active-handle {
    background-color: #3dafe4;
  }
  .x6-widget-transform-resize {
    border-radius: 0;
  }
  .x6-widget-selection-inner {
    border: 1px solid #239edd;
  }
  .x6-widget-selection-box {
    opacity: 0;
  }

  .x6-cell {
    &.highlight {
      rect{
        stroke-width: 2px;
      }

      path:nth-child(2){
        stroke: #1890ff ;
        stroke-width: 1.5px !important;
      }
    }

    &.error {
      // node rect
      rect{
        stroke: #f80101 !important ;
      }

      // edge 
      path:nth-child(2){
        stroke: #f80101 !important;
        // stroke-width: 1.5px !important;
      }
    }

    
  }

  .x6-node-selected rect{
    stroke: #1890ff !important;
    stroke-width: 2px;
  }

  .x6-edge-selected path:nth-child(2){
    stroke: #1890ff !important;
    stroke-width: 1.5px !important;
  }


}

</style>
