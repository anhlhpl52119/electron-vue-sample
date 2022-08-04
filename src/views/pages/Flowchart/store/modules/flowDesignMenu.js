import FlowDesign from "@/services/flow_design"
import FlowDesignService from "@/services/flow_design"
import { NAMESPACE } from "../index"

export default {
// FLOW_DESIGN_MENU
  namespaced: true,
  state: () => ({
    flowDesigns: [],
    selectedFlowDesignId: null,
  
  }),

  actions: {
    async loadFlowDesign({state, rootState}, flowDesignId) {

      if(flowDesignId) {
        state.selectedFlowDesignId = flowDesignId
        const flowDesign = await FlowDesign.getFlowDesign(flowDesignId) 
  
        if(flowDesign) {
          const diagramStructure = JSON.parse(flowDesign['diagramStructure'])
  
          rootState[NAMESPACE].GRAPH.graphInstance.fromJSON(diagramStructure)
          rootState[NAMESPACE].GRAPH.graph.nodes = rootState[NAMESPACE].GRAPH.graphInstance.getNodes().map(node => ({
            id: node.id,
            data: node.data
          }))
          rootState[NAMESPACE].GRAPH.graph.edges = rootState[NAMESPACE].GRAPH.graphInstance.getEdges().map(edge => ({
            id: edge.id, 
            source:  edge.getSourceCellId(),
            target:  edge.getTargetCellId(),
          }))
        }
      } else {
        rootState[NAMESPACE].GRAPH.graph = {
          nodes: [],
          edges: []
        }
        state.selectedFlowDesignId = null
        rootState[NAMESPACE].GRAPH.graphInstance.fromJSON({})
      }
    },
  
  
    async saveFlowDesign({state, dispatch}, item) {
  
      const record = await FlowDesign.createOrUpdate(item)
  
      dispatch('fetchFlowDesignRows')
      return record
    },
  
    async fetchFlowDesignRows({state, commit}) {
      const rows = await FlowDesignService.getFlowDesigns()
      state.flowDesigns = rows
      return rows
    },
  
    async removeFlowDesignRow({state, rootState}, id) {
      let { flowDesigns, selectedFlowDesignId } = state
      try {
        await FlowDesignService.destroyFlowDesign(id)
        state.flowDesigns = flowDesigns.filter(row => row.id !== id)
        if(selectedFlowDesignId === id) {
          state.selectedFlowDesignId = null
          rootState[NAMESPACE].GRAPH.graphInstance.fromJSON({})
        }
      } catch (error) {
        console.log(error)
      }
    },
  }

}