<template>
  <div
    id="stencil"
    ref="stencil"
  />
</template>

<script>
import { Graph, Shape, Addon } from "@antv/x6";
import CONSTANTS from "@/constants/index";

const { NODE_CONSTANT } = CONSTANTS
const OPERATION_GROUP = "OPERATION_GROUP";

export default {
  props: {
    graphInstance: Graph,
    nodes: {
      type: Array,
      default: () => [],
    },
  },
  data: function () {
    return {
      stencil: null,
    };
  },
  watch: {
    graphInstance: function (val) {
      if (val) {
        this.initStencil();
      }
    },
  },

  methods: {
    initStencil() {
      this.stencil = new Addon.Stencil({
        title: "Components",
        target: this.graphInstance,
        search(cell, keyword) {
          return cell.label.indexOf(keyword) !== -1;
        },
        placeholder: "Search by shape name",
        notFoundText: "Not Found",
        // stencilGraphWidth: 200,
        // stencilGraphHeight: 180,
        collapsable: true,
        groups: [
          {
            title: "Operations",
            name: OPERATION_GROUP,
          },
        ],
        layoutOptions: {
          columns: 2,
          columnWidth: 90,
          rowHeight: 60,
        },
      });
      this.$refs["stencil"].appendChild(this.stencil.container);

      this.initComponents();
    },

    initComponents() {
      const queryNode = {
        shape: "query-node",
        label: "Query",
        data: {
          code: NODE_CONSTANT.TYPE.QUERY,
          type: NODE_CONSTANT.TYPE.QUERY,
          select: [],
          from: {},
          join: {
            sources: []
          },
          orderBy: []
        },
      };

      // table-node
      const dataTable = {
        shape: "table-node",

        label: "Table",

        data: {
          code: NODE_CONSTANT.TYPE.TABLE,
          select: [],
          type: NODE_CONSTANT.TYPE.TABLE,
        },
      };

      const exportToTemplate = {
        shape: "output-node",
        label: "Template",
        data: {
          code: "Template",
          type: NODE_CONSTANT.TYPE.EXPORT_TO_TEMPLATE,
        },
      };

      const newQueryNode = this.graphInstance.createNode(queryNode);
      const dataTableNode = this.graphInstance.createNode(dataTable);
      const exportToTemplateNode = this.graphInstance.createNode(exportToTemplate);
      const nodes = [newQueryNode, dataTableNode, exportToTemplateNode];
      this.stencil.load(nodes, OPERATION_GROUP);
      this.stencil.resizeGroup(OPERATION_GROUP, {
        width: 200,
        height: (1 + nodes.length / 2) * 60,
      });
    },
  },
};
</script>
<style scoped lang="scss">
#stencil:deep() {
  flex: 0 0 240px;
  border-left: 1px solid #a8a8a8;
  height: 100%;
  position: relative;

  .x6-widget-stencil {
    background-color: #fff;
  }
  .x6-widget-stencil-title {
    background-color: #fff;
  }
  .x6-widget-stencil-group-title {
    background-color: #fff !important;
  }
}
</style>
