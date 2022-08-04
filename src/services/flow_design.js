import {FlowDesign} from "@/models"

const getFlowDesigns = () => {
  return FlowDesign.findAll()
}

const getFlowDesign = (id) => {
  return FlowDesign.findOne({
    where: {
      id: id
    }
  })

}

const updateFlowDesign = (id, flowDesign) => {
  return FlowDesign.update(flowDesign, {
    where: {id: id}
  })
}

const createFlowDesign = (flowDesign) => {
  return FlowDesign.create(flowDesign)
}

const destroyFlowDesign = (id) => {
  return FlowDesign.destroy({
    where: { id: id },
  })
}

const createOrUpdate = async (flowDesign) => {
  const { id } = flowDesign
  if(id) {
    const ids = await updateFlowDesign(id, flowDesign)
    return {
      id: ids[0],
      ...flowDesign
    }
  } else {
    const record = await createFlowDesign(flowDesign)
    return record

  }
}



export default {
  getFlowDesign,
  createOrUpdate,
  getFlowDesigns,
  updateFlowDesign,
  createFlowDesign,
  destroyFlowDesign
}