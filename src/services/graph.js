
const _getAdjNodeTree = (selectedNode, nodes, edges, {collectEdge, collectNode}) => {
  const sources = []
  const adjEdges = edges.filter(edge => edge.target === selectedNode.id)
  const adjNodes = adjEdges.map(edge => nodes.find(node => node.id === edge.source))
  collectEdge(adjEdges)
  collectNode(adjNodes)

  for(const adjNode of adjNodes) {
    adjNode['sources'] = _getAdjNodeTree(adjNode, nodes, edges, {collectEdge, collectNode} ) 
    sources.push(adjNode)
  }

  return sources
}

const _isCyclicRecur = (currentNode, nodes, edges, parentNodeIdDict) => {

  parentNodeIdDict[currentNode.id] = true
  const nearestSourceNodes = getNearestSourceNodesByNodeEdge(currentNode, nodes, edges)

  for(const nearestSourceNode of nearestSourceNodes) {
    
    if(parentNodeIdDict[nearestSourceNode.id] === true) {   
      return true
    } else {
      const clonedParentNodeIdDict = JSON.parse(JSON.stringify(parentNodeIdDict))
      const isCycle = _isCyclicRecur(nearestSourceNode, nodes, edges, clonedParentNodeIdDict)
      if(isCycle) return isCycle
    }

  }

  return false
}

const _getCyclesRecur = (currentNode, nodes, edges, rootNode, parentNodeIdDict, visitedEdges, callback) => {

  parentNodeIdDict[currentNode.id] = true

  const nearestSourceNodes = getNearestSourceNodesByNodeEdge(currentNode, nodes, edges)

  for(const nearestSourceNode of nearestSourceNodes) {
    
    if(nearestSourceNode.id === rootNode.id){
      callback({
        nodeIds: Object.keys(parentNodeIdDict),
        edgeIds: visitedEdges.map(edge => edge.id)
      })

    } else if(parentNodeIdDict[nearestSourceNode.id] === true) {  

      return
    
    } else {
      const clonedParentNodeIdDict = JSON.parse(JSON.stringify(parentNodeIdDict))
      const edge = edges.find(edge => edge.source === nearestSourceNode.id && edge.target === currentNode.id)
      const clonedEdges = JSON.parse(JSON.stringify([...visitedEdges, edge]))
      _getCyclesRecur(nearestSourceNode, nodes, edges, rootNode, clonedParentNodeIdDict, clonedEdges, callback)
      
    }

  }

  return
}



/**
 * 
 * @param {*} selectedNode : #Node
 * @param {*} nodes : Array of #Node
 * @param {*} edges : Array of #Edge
 * @returns 
 * 
 * selectedNode: #node
 * #Node: {id: String}
 * #Edge: {id: String, source: String, target: String}
 */
const getAdjSourceNodesTree = (selectedNode, graph) => {

  const {edges, nodes} = graph

  const isCycle = isExistCycle(nodes, edges)

  let affectNodes = new Set()
  let affectEdges = new Set()
  let tree = {}
  if(!isCycle) {
    tree = _getAdjNodeTree(selectedNode, nodes, edges, {
      collectEdge: (edges) => {
        edges.forEach(edge => affectEdges.add(edge.id))
        
      },
      collectNode: (nodes) => {
        nodes.forEach(node => affectNodes.add(node.id))
        
      },
    })
  } 

  

  return {
    tree,
    affectEdges,
    affectNodes
  }
}


/**
 * 
 * @param {*} selectedNode : Node
 * @param {*} graph : Graph
 * @returns 

 */
const getNearestSourceNodesByGraph = (selectedNode, graph) => {
  const {edges, nodes} = graph

  return getNearestSourceNodesByNodeEdge(selectedNode, nodes, edges)

}


const getNearestSourceNodesByNodeEdge = (selectedNode, nodes, edges) => {

  return edges.filter(edge => edge.target === selectedNode.id)
          .map(edge => nodes.find(node => node.id === edge.source))

}



const isExistCycle = (nodes, edges) => {
  for(const node of nodes) {
    const isCycle = _isCyclicRecur(node, nodes, edges, {})
    if(isCycle) return true
  }
  return false
}



const getCycles = (nodes, edges) => {
  let cycles = []
  for(const node of nodes) {
    _getCyclesRecur(node, nodes, edges, node, {}, [], (cycle)=>{
      cycles.push(cycle)
    })
  }

  return cycles
}

export default {
  getAdjSourceNodesTree,
  getNearestSourceNodesByGraph,
  getNearestSourceNodesByNodeEdge,
  isExistCycle,
  getCycles
}