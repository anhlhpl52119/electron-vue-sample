<template>
  <div class="component-border">
    <!--  Conjunctive Operator-->
    <a-radio-group
        v-model:value="conditionsStructure3rd.operator"
        :size="buttonSize"
        button-style="solid"
        style="margin-right: 10px"
        :disabled="conditionsStructure3rd.subConditions.length < 2"
        @change="handleGroupConjunctiveOperatorChange"
    >
      <a-radio-button value="AND"> AND</a-radio-button>
      <a-radio-button value="OR"> OR</a-radio-button>
    </a-radio-group>
    <!--  ADD SUB  CONDITION-->
    <a-dropdown :trigger="['click']">
      <template #overlay>
        <a-menu @click="handleClickAddConditionButton">
          <a-menu-item key="ITEM">
            <PlusOutlined/>
            Add Sub Condition
          </a-menu-item>
        </a-menu>
      </template>
      <a-button :size="buttonSize" shape="circle">
        <template #icon>
          <PlusOutlined/>
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
        <CloseOutlined/>
      </template>
    </a-button>
  </div>
  <!--  Render Component-->
  <div
      v-for="condition in conditionsStructure3rd.subConditions"
      :key="condition.id"
      class="component-border"
  >
    <SingleCondition
        :value="condition"
        :from-selected-tables="tableFieldOptions"
        @remove-condition="() => handleRemoveCondition(condition.id)"
        @change="handleSingleConditionChange"
    />
  </div>
</template>

<script>
import {CloseOutlined, PlusOutlined} from "@ant-design/icons-vue";
import {v4 as uuidv4} from "uuid";
import SingleCondition from "./SingleCondition";

export default {
  components: {
    CloseOutlined,
    SingleCondition,
    PlusOutlined,
  },
  props: {
    fromSelectedTables: {
      type: Array,
      default: () => [],
    },
    chosenNodeDatas: {
      type: Array,
      default: () => [],
    },
    value: {
      type: Object,
      default: () => {
      },
    },
  },
  emits: ["removeGroup", "sub-condition3rd-change"],
  data: function () {
    return {
      conjunctiveOperatorValue: "AND",
      buttonSize: "small",
      conditionsStructure3rd: [],
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
        this.conditionsStructure3rd = this.value;
      },
    },
  },
  methods: {
    handleClickAddConditionButton: function () {
      this.conditionsStructure3rd.subConditions = [
        ...this.conditionsStructure3rd.subConditions,
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
    },
    handleRemoveCondition: function (id) {
      this.conditionsStructure3rd.subConditions =
          this.conditionsStructure3rd.subConditions.filter((e) => e.id !== id);
      this.updateValueChange();
    },
    handleGroupConjunctiveOperatorChange(val) {
      this.conditionsStructure3rd.operator = val.target.value;
      this.updateValueChange();
    },
    handleSingleConditionChange: function (singleConditionData) {
      this.conditionsStructure3rd.subConditions =
          this.conditionsStructure3rd.subConditions.map((item) => {
            if (item.id === singleConditionData.id) {
              return singleConditionData;
            }
            return item;
          });
      this.updateValueChange();
    },
    updateValueChange() {
      const ouput = this.conditionsStructure3rd;
      this.$emit("sub-condition3rd-change", ouput);
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
