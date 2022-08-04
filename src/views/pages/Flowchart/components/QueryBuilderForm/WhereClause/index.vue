<template>
  <!--  ADD GRUOP & CONDITION-->
  <a-dropdown :trigger="['click']">
    <template #overlay>
      <a-menu @click="handleClickAddConditionButton">
        <a-menu-item key="ITEM">
          <PlusOutlined />
          Add Condition
        </a-menu-item>
        <a-menu-item key="GROUP">
          <PlusOutlined />
          Add Group
        </a-menu-item>
      </a-menu>
    </template>
    <a-button
      type="primary"
      shape="circle"
      style="margin-bottom: 10px"
    >
      <template #icon>
        <PlusOutlined />
      </template>
    </a-button>
  </a-dropdown>
  <!--  Conjunctive Operator-->
  <div
    v-if="conditionsStructureWrapper.length > 1"
    style="margin-bottom: 10px"
  >
    <a-radio-group
      :value="value.operator"
      :size="buttonSize"
      button-style="solid"
      @change="handleConjunctiveOperatorChange"
    >
      <a-radio-button value="AND">
        AND
      </a-radio-button>
      <a-radio-button value="OR">
        OR
      </a-radio-button>
    </a-radio-group>
  </div>
  <!--  Render Component-->
  <!--  Cover Condition-->
  <div
    v-for="condition in conditionsStructureWrapper"
    :key="condition.id"
  >
    <div
      v-if="condition.type === 'GROUP'"
      class="group-condition-border"
    >
      <SubCondition1st
        :value="condition"
        :chosen-node-datas="chosenNodeDatas"
        @remove-group="() => handleRemoveCondition(condition.id)"
        @sub-condition1st-change="handleGroupCondition1stChange"
      />
    </div>
    <div v-if="condition.type === 'ITEM'">
      <SingleCondition
        :value="condition"
        :from-selected-tables="tableFieldOptions"
        @remove-condition="() => handleRemoveCondition(condition.id)"
        @change="handleSingleConditionChange"
      />
    </div>
  </div>
</template>

<script>
import SingleCondition from "./components/SingleCondition";
import SubCondition1st from "./components/SubCondition1st";
import {PlusOutlined} from "@ant-design/icons-vue";
import {v4 as uuidv4} from "uuid";

export default {
  components: {
    SubCondition1st,
    SingleCondition,
    PlusOutlined,
  },
  props: {
    chosenNodeDatas: {
      type: Array,
      default: () => [],
    },

    value: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["where-condition-change"],
  data: function () {
    return {
      buttonSize: "small",
      conditionsStructureWrapper: [],
      wapperGroup: {type: "GROUP", operator: "AND", subConditions: []},
    };
  },
  computed: {
    tableFieldOptions: function () {
      const output = this.chosenNodeDatas.map((nodeData) => {
        return {
          value: nodeData.code,
          label: nodeData.code,
          children: nodeData.select.map((selectField) => {
            return {
              value: selectField.alias,
              label: selectField.alias,
            };
          }),
        };
      });

      return output;
    },
  },

  watch: {
    value: {
      deep: true,
      immediate: true,
      handler() {
        if (this.value && this.value.type === "GROUP") {
          this.conditionsStructureWrapper = this.value.subConditions;
        } else if (this.value && this.value.type === "ITEM") {
          this.conditionsStructureWrapper = [this.value];
        }
      },
    },
  },
  methods: {
    handleConjunctiveOperatorChange: function (val) {
      this.wapperGroup = {...this.wapperGroup, operator: val.target.value};
      this.updateValueChange();
    },
    handleClickAddConditionButton: function (eventClick) {
      if (eventClick.key === "ITEM") {
        this.conditionsStructureWrapper = [
          ...this.conditionsStructureWrapper,
          {
            id: uuidv4(),
            type: "ITEM",
            op: "",
            param1: "",
            param2: {
              value: [],
              valueType: "TABLE FIELD",
            },
          },
        ];
      } else {
        this.conditionsStructureWrapper = [
          ...this.conditionsStructureWrapper,
          {
            id: uuidv4(),
            type: "GROUP",
            operator: "AND",
            subConditions: [
              {
                id: uuidv4(),
                type: "ITEM",
                op: "",
                param1: "",
                param2: {
                  value: [],
                  valueType: "TABLE FIELD",
                },
              },
              {
                id: uuidv4(),
                type: "ITEM",
                op: "",
                param1: "",
                param2: {
                  value: [],
                  valueType: "TABLE FIELD",
                },
              },
            ],
          },
        ];
      }
    },
    handleRemoveCondition: function (id) {
      this.conditionsStructureWrapper = this.conditionsStructureWrapper.filter(
          (e) => e.id !== id
      );
      this.updateValueChange();
    },
    handleSingleConditionChange: function (singleConditionData) {
      this.conditionsStructureWrapper = this.conditionsStructureWrapper.map(
          (item) => {
            if (item.id === singleConditionData.id) {
              return singleConditionData;
            }
            return item;
          }
      );
      this.updateValueChange();
    },
    handleGroupCondition1stChange: function (GroupConditionData) {
      this.conditionsStructureWrapper = this.conditionsStructureWrapper.map(
          (item) => {
            if (item.id === GroupConditionData.id) {
              return GroupConditionData;
            }
            return item;
          }
      );
      this.updateValueChange();
    },
    updateValueChange() {
      if (this.conditionsStructureWrapper.length > 1) {
        const groupStatement = {
          ...this.wapperGroup,
          subConditions: this.conditionsStructureWrapper,
        };
        this.$emit("where-condition-change", groupStatement);
      } else {
        const singleStatement = this.conditionsStructureWrapper[0];
        this.$emit("where-condition-change", singleStatement);
      }

    },
  },
};
</script>

<style scoped>
.group-condition-border {
  border: 1px solid #9d9999;
  border-radius: 5px;
  background: #fafafa;
  margin-bottom: 10px;
}
</style>
