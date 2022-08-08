<template>
  <div class="single-condition-border">
    <a-row
      type="flex"
      style="margin: 5px"
      justify="space-around"
      align="middle"
    >
      <!--  SELECT FIELD-->
      <a-col flex="2">
        <a-cascader
          :show-search="true"
          style="width: 97%"
          :value="param1FieldValue"
          :options="fromSelectedTables"
          placeholder="Select Field"
          size="small"
          @change="handleParam1Change"
        />
      </a-col>
      <!--  CONDITION OPERATOR-->
      <a-col flex="2">
        <a-select
          :value="value.op"
          style="width: 90%"
          :size="buttonSize"
          :options="OPERATOR_OPTIONS"
          placeholder="Operator"
          @change="handleChangeConditionOperator"
        />
      </a-col>
      <!--  Remove Condition Button-->
      <a-col flex="15px">
        <a-button
          type="text"
          shape="circle"
          :size="buttonSize"
          danger
          @click="$emit('removeCondition')"
        >
          <template #icon>
            <CloseOutlined />
          </template>
        </a-button>
      </a-col>
    </a-row>
    <a-row>
      <a-col flex="70%">
        <a-input-group
          compact
          style="margin: 2px 5px 5px 5px"
        >
          <a-select
            :value="param2TypeValue"
            :size="buttonSize"
            :options="PARAM_TYPE"
            @change="handleTypeChange"
          />
          <a-input
            v-if="param2TypeValue === 'INPUT'"
            v-model:value="valueInputCondition"
            :size="buttonSize"
            placeholder="Input value"
            @change="handleInputTypeChange"
          />
          <a-cascader
            v-if="param2TypeValue === 'TABLE FIELD'"
            :show-search="true"
            style="width: 200px"
            :value="param2FieldValue"
            :options="fromSelectedTables"
            placeholder="Select Field"
            size="small"
            @change="handleParam2Change"
          />
        </a-input-group>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import {CloseOutlined} from "@ant-design/icons-vue";
import CONSTANTS from "@/constants/index.js";

const {QUERY_CONSTANT} = CONSTANTS;

export default {
  components: {
    CloseOutlined,
  },
  props: {
    fromSelectedTables: {
      type: Array,
      default: () => [],
    },
    value: {
      type: Object,
      default: () => {},
    },
  },
  emits: ["removeCondition", "change"],
  data: function () {
    return {
      buttonSize: "small",
    };
  },
  computed: {
    OPERATOR_OPTIONS: function () {
      return Object.keys(QUERY_CONSTANT.WHERE.OP).map((key) => {
        return {
          value: QUERY_CONSTANT.WHERE.OP[key],
          label: QUERY_CONSTANT.WHERE.OP[key],
        };
      });
    },
    PARAM_TYPE: function () {
      return Object.keys(QUERY_CONSTANT.WHERE.PARAM_TYPE).map((key) => {
        return {
          value: QUERY_CONSTANT.WHERE.PARAM_TYPE[key],
          label: QUERY_CONSTANT.WHERE.PARAM_TYPE[key],
        };
      });
    },
    param1FieldValue: function () {
      if (this.value?.param1) {
        return this.value.param1;
      }
      return [];
    },
    param2FieldValue: function () {
      if (this.value?.param2.value) {
        return this.value.param2.value;
      }
      return [];
    },
    param2TypeValue: function () {
      if (this.value?.param2.valueType) {
        return this.value.param2.valueType;
      }
      return "TABLE FIELD";
    },
  },
  watch: {
    valueInputCondition: {
      immediate: true,
      handler() {
        if (this.value.param2.valueType === "INPUT") {
          this.valueInputCondition = this.value.param2.value;
        }
      },
    },
  },
  methods: {
    handleParam1Change(val) {
      this.$emit("change", {
        ...this.value,
        param1: val,
      });
    },

    handleParam2Change(val) {
      this.$emit("change", {
        ...this.value,
        param2: {
          value: val,
          valueType: "TABLE FIELD",
        },
      });
    },
    handleTypeChange(val) {
      this.$emit("change", {
        ...this.value,
        param2: {valueType: val, value: []},
      });
    },

    handleInputTypeChange() {
      this.$emit("change", {
        ...this.value,
        param2: {
          value: [this.valueInputCondition],
          valueType: "INPUT",
        },
      });
    },
    handleChangeConditionOperator(val) {
      this.$emit("change", {
        ...this.value,
        op: val,
      });
    },
  },
};
</script>

<style scoped>
.single-condition-border {
  border: 1px solid #dbdbdb;
  border-radius: 5px;
  background: #ffffff;
  margin: 5px 0px 5px 0px;
}
</style>
