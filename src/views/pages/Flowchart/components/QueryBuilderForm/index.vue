<template>
  <div>
    <a-form
      name="basic"
      layout="vertical"
      autocomplete="off"
    >
      <a-form-item
        label="Name"
        required
      >
        <a-input
          :value="formData.code"
          @change="handleCodeChange"
        />
      </a-form-item>
    </a-form>

    <a-collapse v-model:activeKey="collapseActiveKeys">
      <a-collapse-panel
        key="1"
        header="Data Source"
      >
        <div>
          <FromClause
            :value-from="formData.from"
            :value-join="formData.join"
            :connected-source-nodes="nearestSourceNodes"
            :node-connected-structure="
              nearestSourceNodes.map((m) => ({
                title: m.data.code,
                key: m.id,
                fields: [...m.data.select].map((fl) => ({
                  key: fl.field.concat('_', m.id),
                  title: fl.alias,
                  type: fl.type,
                  alias: fl.alias,
                  isChecked: false,
                })),
              }))
            "
            @output-from-structure="handleFromClauseChange"
            @main-table-change="handleMainTableChange"
            @join-table-change="handleJoinTableChange"
          />
        </div>
      </a-collapse-panel>
      <a-collapse-panel
        key="2"
        header="Column"
      >
        <div class="select-clause-container">
          <SelectClause
            :key="selectedNode.id"
            :value="formData.select"
            :chosen-node-datas="chosenNodeDatas"
            @change="handleSelectClauseChange"
          />
        </div>
      </a-collapse-panel>
      <a-collapse-panel
        key="3"
        header="Condition"
      >
        <div>
          <WhereClause
            v-model:value="formData.where"
            :chosen-node-datas="chosenNodeDatas"
            @where-condition-change="handleWhereConditionChange"
          />
        </div>
      </a-collapse-panel>
      <a-collapse-panel
        key="6"
        header="Sort"
      >
        <div>
          <OrderByClause
            v-model:value="formData.orderBy"
            :chosen-node-datas="chosenNodeDatas"
          />
        </div>
      </a-collapse-panel>
      <a-collapse-panel
        key="7"
        header="Remove Duplicate"
      >
        <div>
          <RemoveDuplicate />
        </div>
      </a-collapse-panel>
      <a-collapse-panel
        key="8"
        header="Group By"
      >
        <div>
          <GroupByClause />
        </div>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script>
import SelectClause from "./SelectClause";
import FromClause from "./FromClause";
import WhereClause from "./WhereClause";
import OrderByClause from "./OrderByClause";
import RemoveDuplicate from "./RemoveDuplicate";
import GroupByClause from "./GroupByClause"

export default {
  components: {
    SelectClause,
    FromClause,
    WhereClause,
    OrderByClause,
    RemoveDuplicate,
    GroupByClause
  },
  props: {
    selectedNode: {
      type: Object,
      default: () => null,
    },

    nearestSourceNodes: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["selectOutputStructure", "fromOutputStructure", "change"],
  data: function () {
    return {
      collapseActiveKeys: ["1", "2", "3", "6"],
      formData: {},
      chosenNodeDatas: [],
    };
  },

  watch: {
    selectedNode: {
      handler() {
        if (this.selectedNode?.data) {
          this.formData = JSON.parse(JSON.stringify(this.selectedNode?.data));
        } else {
          this.formData = {};
        }
      },
      immediate: true,
    },

    formData: {
      handler() {
        this.$emit("change", this.formData);
      },
      deep: true,
      immediate: true,
    },

    "formData.from": {
      handler() {
        this.setChosenNodeData();
      },
      deep: true,
      immediate: true,
    },

    "formData.join": {
      handler() {
        this.setChosenNodeData();
      },
      deep: true,
      immediate: true,
    },
    "formData.where": {
      handler() {
        this.setChosenNodeData();
      },
      deep: true,
      immediate: true,
    },

    chosenNodeDatas() {
      // update select field
      const chosenNodeDataCodes = this.chosenNodeDatas.map(
          (nodeData) => nodeData.code
      );
      this.formData.select = this.formData.select.filter((selectField) => {
        return chosenNodeDataCodes.includes(selectField.table);
      });

      // update sort
      this.formData.orderBy = this.formData.orderBy.filter((order) => {
        return chosenNodeDataCodes.includes(order.table);
      });
    },
  },

  methods: {
    handleSelectClauseChange: function (select) {
      this.formData.select = select
    },

    handleFromClauseChange: function (fromClauseData) {
      this.formData = {
        ...this.formData,
        from: {
          code: fromClauseData?.code || "",
        },
        join: fromClauseData?.join || {},
      };
    },

    handleMainTableChange(code) {
      this.formData = {
        ...this.formData,
        from: {
          code: code,
        },
      };
    },

    handleJoinTableChange(joinSources) {
      this.formData = {
        ...this.formData,
        join: {
          sources: joinSources,
        },
      };
    },
    handleWhereConditionChange(whereCondition) {
      this.formData = {
        ...this.formData,
        where: whereCondition,
      };
    },


    setChosenNodeData() {
      const {from, join} = this.formData;
      this.chosenNodeDatas = this.nearestSourceNodes.reduce((result, node) => {
        if (
            from?.code === node.data.code ||
            join?.sources?.map((source) => source.code).includes(node.data.code)
        ) {
          return [...result, node.data];
        }
        return result;
      }, []);
    },

    handleCodeChange(e) {
      if (e.target.value) {
        this.formData.code = e.target.value.replace(/[^\w\d]/gi, "");
      } else {
        this.formData.code = "";
      }
    },
  },
};
</script>
<style scoped></style>
