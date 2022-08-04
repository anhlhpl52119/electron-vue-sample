<template>
  <RightMenu
    :is-open="isOpen"
    :visible="visible"
    :title="selectedNode?.data?.code"
    @update:is-open="handleToggleOpen"
  >
    <div style="width: 100%; height: 100%">
      <template v-if="selectedNode">
        <McTemplateExportForm
          v-if="selectedNode.data.type === NODE_TYPE.EXPORT_TO_TEMPLATE"
          :selected-node="selectedNode"
          :graph="graph"
          :nearest-source-nodes="nearestSourceNodes"
        />

        <ExecutableDataFormWrapper 
          v-else-if="[NODE_TYPE.TABLE, NODE_TYPE.QUERY].includes(selectedNode?.data?.type)"
        />
      </template>
    </div>
  </RightMenu>
</template>
<script>

import {mapMutations, mapState, mapGetters} from "vuex" 
import {NAMESPACE} from "@/views/pages/Flowchart/store" 

import Constants from "@/constants/index"

import McTemplateExportForm from "./McTemplateExportForm"
import ExecutableDataFormWrapper from "./ExecutableDataFormWrapper"
import RightMenu from "../../components/RightMenu"

const { NODE_CONSTANT } = Constants
export default {
  components: {
    McTemplateExportForm,
    ExecutableDataFormWrapper,
    RightMenu
  },
  watch: {
    'selectedNode': function() {
      if(this.selectedNode) {

      }
    }
  },
  computed: {
    ...mapState(`${NAMESPACE}/RIGHT_DRAWER`, {
      visible: state => state.visible,
      isOpen: state => state.isOpen
    }),

    ...mapState(`${NAMESPACE}/GRAPH`, {
      graph: ({graph}) => graph,
    }),

    ...mapGetters(`${NAMESPACE}/GRAPH`, [
      'selectedNode',
      'nearestSourceNodes'
    ]),
    NODE_TYPE: () => NODE_CONSTANT.TYPE

  },
  methods: {
    ...mapMutations(`${NAMESPACE}/RIGHT_DRAWER`, {
      'toggleRightDrawer': 'toggle'
  }),
    ...mapMutations(`${NAMESPACE}/GRAPH`, [
      'updateNodeData'
    ]),

    handleToggleOpen(val) {
      this.toggleRightDrawer(val)
    }
  }
}
</script>