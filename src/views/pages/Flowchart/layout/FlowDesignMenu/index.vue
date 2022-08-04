<template>
  <div class="container">
    <a-typography-title
      class="header-text"
      :level="4"
    >
      Flow Designs
    </a-typography-title>
    <a-divider
      style="height: 1px; background-color: #f8f8f8"
      orientation-margin="50px"
    />

    <a-button
      type="dashed"
      block
      @click="handleAddBtnClick"
    >
      <template #icon>
        <plus-outlined :style="{ fontSize: '16px' }" />
      </template>
    </a-button>

    <div class="menu-wrapper">
      <a-menu
        v-model:selectedKeys="selectedKeys"
        style="width: 100%"
        :mode="'vertical'"
      >
        <a-menu-item
          v-for="item of flowDesigns"
          :key="item.id"
          style="padding-left: 5px"
        >
          <div
            style="display: flex; align-items: baseline"
            @dbclick="(_) => (editingFlowDesignId = item.id)"
          >
            <span> {{ item.id }}.&nbsp; </span>
            <span> {{ item.name }} </span>

            <a-popover
              :ref="`rename_${item.id}`"
              title="Rename"
              placement="right"
              trigger="click"
            >
              <template #content>
                <span style="display: flex">
                  <a-input
                    v-model:value="item.name"
                    placeholder="Flow name"
                  />
                  <a-button
                    type="primary"
                    @click="handleItemChange(item)"
                  >
                    <template #icon><SaveOutlined /></template>
                  </a-button>
                </span>
              </template>
              <a-button type="link">
                <template #icon>
                  <EditOutlined />
                </template>
              </a-button>
            </a-popover>

            <a-popconfirm
              title="Delete this item ?"
              placement="right"
              ok-text="Yes"
              cancel-text="Cancel"
              @confirm="() => handleDestroyItem(item.id)"
            >
              <span style="margin-left: auto">
                <!-- <a-typography-text type="danger"> X </a-typography-text> -->
                <CloseCircleOutlined style="color: red" />
              </span>
            </a-popconfirm>
          </div>
        </a-menu-item>
      </a-menu>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import { NAMESPACE } from "@/views/pages/Flowchart/store";
import {
  PlusOutlined,
  CloseCircleOutlined,
  EditOutlined,
  SaveOutlined,
} from "@ant-design/icons-vue";
import { message } from "ant-design-vue";

let flowDesignNameChangeTimeout = null;
export default {
  components: {
    PlusOutlined,
    CloseCircleOutlined,
    EditOutlined,
    SaveOutlined,
  },
  data() {
    return {
      selectedKeys: [],
      editingFlowDesignId: null,
      visiblePopover: true,
    };
  },
  computed: {
    ...mapState(`${NAMESPACE}/FLOW_DESIGN_MENU`, {
      flowDesigns: (state) => state.flowDesigns,
    }),
  },
  watch: {
    selectedKeys(val) {
      this.loadFlowDesign(val[0] || null);
    },
  },
  created() {
    this.fetchFlowDesignRows().then((rows) => {
      if (rows.length > 0) {
        this.selectedKeys = [rows[0].id];
      }
    });
  },

  methods: {
    ...mapActions(`${NAMESPACE}/FLOW_DESIGN_MENU`, [
      "saveFlowDesign",
      "loadFlowDesign",
      "fetchFlowDesignRows",
      "removeFlowDesignRow",
    ]),

    handleDestroyItem(id) {
      this.removeFlowDesignRow(id);
      message.success("This item deleted successfully!");
    },

    handleItemChange(item) {
      this.editingFlowDesignId = null;
      if (flowDesignNameChangeTimeout) {
        clearTimeout(flowDesignNameChangeTimeout);
      }
      flowDesignNameChangeTimeout = setTimeout(() => {
        this.saveFlowDesign(item.dataValues);
        flowDesignNameChangeTimeout = null;
      }, 100);
    },

    async handleAddBtnClick() {
      const record = await this.saveFlowDesign({
        name: "Flow " + (this.flowDesigns.length + 1),
        diagramStructure: "{}",
      });
      this.$nextTick((_) => (this.selectedKeys = [record.id]));
    },
  },
};
</script>
<style lang="scss" scoped>
.container {
  border: 1px solid #a8a8a8;
  padding: 5px;

  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  white-space: nowrap;
  align-items: stretch;

  overflow: hidden;
}

.header-text {
  text-align: center;
  margin: 5px;
}


.menu-wrapper {
  flex: 1;
  overflow-y: scroll;
}
</style>
