<template>
  <div class="component-border">
    <!--  Conjunctive Operator-->
    <a-radio-group
      :value="conditionsStructure1st.operator"
      :size="buttonSize"
      button-style="solid"
      style="margin-right: 10px"
      :disabled="conditionsStructure1st.subConditions.length < 2"
      @change="handleGroupConjunctiveOperatorChange"
    >
      <a-radio-button value="AND"> AND </a-radio-button>
      <a-radio-button value="OR"> OR </a-radio-button>
    </a-radio-group>
    <!--  ADD SUB  CONDITION-->
    <a-dropdown :trigger="['click']">
      <template #overlay>
        <a-menu @click="handleClickAddConditionButton">
          <a-menu-item key="ITEM">
            <PlusOutlined />
            Add Sub Condition
          </a-menu-item>
          <a-menu-item key="GROUP">
            <PlusOutlined />
            Add Sub Group Condition
          </a-menu-item>
        </a-menu>
      </template>
      <a-button :size="buttonSize" shape="circle">
        <template #icon>
          <PlusOutlined />
        </template>
      </a-button>
    </a-dropdown>
    <!--  Remove SUB GROUP condition Button-->
    <a-button
      shape="circle"
      :size="buttonSize"
      danger
      style="margin-left: 10px"
      @click="$emit('removeGroup')"
    >
      <template #icon>
        <CloseOutlined />
      </template>
    </a-button>
  </div>
  <!--  Render Component-->
  <div
    v-for="condition in conditionsStructure1st.subConditions"
    :key="condition.id"
    class="component-border"
  >
    <div v-if="condition.type === 'GROUP'" class="group-condition-border">
      <SubCondition2nd
        :value="condition"
        :from-selected-tables="tableFieldOptions"
        :chosen-node-datas="chosenNodeDatas"
        @remove-group="() => handleRemoveCondition(condition.id)"
        @sub-condition2nd-change="handleGroupCondition2ndChange"
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
import { CloseOutlined, PlusOutlined } from "@ant-design/icons-vue";
import SingleCondition from "./SingleCondition";
import { v4 as uuidv4 } from "uuid";
import SubCondition2nd from "./SubCondition2nd";


export default {
  components: {
    CloseOutlined,
    SingleCondition,
    SubCondition2nd,
    PlusOutlined,
  },
  props: {
    chosenNodeDatas: {
      type: Array,
      default: () => [],
    },
    fromSelectedTables: {
      type: Array,
      default: () => [],
    },
    value: {
      type: Object,
      default: () => {},
    },
  },
  emits: ["removeGroup", "sub-condition1st-change"],
  data: function () {
    return {
      buttonSize: "small",
      conditionsStructure1st: [],
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
        this.conditionsStructure1st = this.value;
      },
    },
  },

  methods: {
    handleClickAddConditionButton: function (eventClick) {
      if (eventClick.key === "ITEM") {
        this.conditionsStructure1st.subConditions = [
          ...this.conditionsStructure1st.subConditions,
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
        this.conditionsStructure1st.subConditions = [
          ...this.conditionsStructure1st.subConditions,
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
    handleGroupConjunctiveOperatorChange(val) {
      this.conditionsStructure1st.operator = val.target.value;
      this.updateValueChange();
    },
    handleRemoveCondition: function (id) {
      this.conditionsStructure1st.subConditions =
        this.conditionsStructure1st.subConditions.filter((e) => e.id !== id);
      this.updateValueChange();
    },
    handleGroupCondition2ndChange: function (GroupConditionData) {
      this.conditionsStructure1st.subConditions =
        this.conditionsStructure1st.subConditions.map((item) => {
          if (item.id === GroupConditionData.id) {
            return GroupConditionData;
          }
          return item;
        });
      this.updateValueChange();
    },
    handleSingleConditionChange: function (singleConditionData) {
      this.conditionsStructure1st.subConditions =
        this.conditionsStructure1st.subConditions.map((item) => {
          if (item.id === singleConditionData.id) {
            return singleConditionData;
          }
          return item;
        });
      this.updateValueChange();
    },
    updateValueChange() {
      const ouput = this.conditionsStructure1st;
      this.$emit("sub-condition1st-change", ouput);
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
  margin-left: 10px;
}
.component-border {
  margin: 5px 5px 5px 10px;
}
</style>
