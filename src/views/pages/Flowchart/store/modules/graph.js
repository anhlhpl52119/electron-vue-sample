import GraphService from "@/services/graph"
export default {
  namespaced: true,
  /**
   * @graphInstance : Instance of Graph x6 library
   * @graph : {
   *    edges: Array of @Edge
   *    node: Array of @Node
   * } 
   * @Edge : {
   *    id: String,
   *    source: String => Id of source cell
   *    target: String => Id of target cell
   * }
   * 
   * @Node : {
   *  id: String,
   *  data: Object
   * }
   */
  state: () => ({
    selectedNodeId: null,
    graphInstance: null,
    graph: {
      edges: [],
      nodes: []
    },
  }),

  mutations: {
      
    setSelectedNode(state, nodeId) {
      state.selectedNodeId = nodeId
    },

    updateNodeData(state, {nodeId, data}) {
      if(nodeId && data) {

        const {nodes} = state.graph
        const node = nodes.find(_node => _node.id === nodeId)
        if(node) {
          node.data = data
          const nodeInstance = state.graphInstance.getCellById(nodeId)
          const clonedNodeData = JSON.parse(JSON.stringify(node.data))
          nodeInstance.setData(clonedNodeData, { overwrite: true,
          deep: true })
        }
      }
    },

    addNode(state, node) {
      state.graph.nodes.push({
        id: node.id,
        data: node.data
      })
    },

    removeNode(state, nodeId) {
      state.graph.nodes = state.graph.nodes.filter(node => node.id !== nodeId)

    },

    updateNode(state, node) {
      let chosenNode = state.graph.nodes.find(_node => _node.id === node.id)
      chosenNode = node
    },

    addEdge(state, edge) {
      state.graph.edges.push({
        id: edge.id,
        source: edge.getSourceCellId(),
        target: edge.getTargetCellId(),

      })
    },

    removeEdge(state, edgeId) {
      state.graph.edges = state.graph.edges.filter(edge => edge.id !== edgeId)

    },

    updateEdge(state, edge) {
      let chosenEdge = state.graph.edges.find(_edge => _edge.id === edge.id)
      chosenEdge = edge
    },

    setGraphInstance(state, graphInstance) {
      state.graphInstance = graphInstance
    },
  },

  getters: {
    nearestSourceNodes: (state) => {
      const { selectedNodeId, graph } = state
      let connectedNodes = []
      const selectedNode =  graph.nodes.find(node => node.id === selectedNodeId)
      if(selectedNode) {
        connectedNodes = GraphService.getNearestSourceNodesByGraph(selectedNode, graph)
      }
      return connectedNodes
    },

    selectedNode: (state) => {
      const {graph, selectedNodeId } = state
      return graph.nodes.find(node => node.id === selectedNodeId)
    }
  }
}