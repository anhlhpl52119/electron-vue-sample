<template>
  <a-row
    type="flex"
    style="margin: 5px"
    justify="space-around"
    align="middle"
  >
    <a-col flex="2">
      <a-select
        :value="value.type"
        style="width: 97%; margin-left: 5px"
        placeholder="Join type"
        :options="JOIN_TYPE_OPTIONS"
        @change="handleJoinTypeChange"
      />
    </a-col>
    <a-col flex="2">
      <a-select
        :value="value.code"
        placeholder="Select Join Table"
        style="width: 90%"
        :options="joinableTableOptions"
        @change="handleJoinTableChange"
      />
    </a-col>
    <a-col flex="15px">
      <div style="margin: 5px">
        <a-button
          type="primary"
          size="small"
          shape="circle"
          danger
          @click="$emit('remove')"
        >
          <template #icon>
            <CloseOutlined />
          </template>
        </a-button>
      </div>
    </a-col>
  </a-row>
  <div
    v-for="joinCondition in listJoinConditions"
    :key="joinCondition.id"
  >
    <a-row type="flex">
      <a-col flex="25px">
        <a-divider
          type="vertical"
          style="height: 28px; background-color: #7cb305; margin-left: 16px"
        />
      </a-col>
      <a-col flex="150px">
        <a-cascader
          :value="joinCondition.data.field1"
          :options="[mainTable]"
          :disabled="!value.code"
          :field-names="editDataLabel"
          placeholder="Main Field"
          size="small"
          :show-search="true"
          @change="(val) => handleOnConditionField1Change(joinCondition.id, val)"
        />
      </a-col>
      <a-typography-text keyboard>
        =
      </a-typography-text>
      <a-col flex="150px">
        <a-cascader
          :show-search="true"
          :value="joinCondition.data.field2"
          :options="joinedTableFieldOptions"
          :disabled="value.code === ''"
          :field-names="editDataLabel"
          placeholder="Joined Field"
          size="small"
          @change="(val) => handleOnConditionField2Change(joinCondition.id, val)"
        />
      </a-col>
      <a-col flex="10px">
        <a-button
          type="text"
          danger
          shape="circle"
          size="small"
          @click="_ => handleRemoveJoinCondition(joinCondition.id)"
        >
          <template #icon>
            <CloseOutlined />
          </template>
        </a-button>
      </a-col>
    </a-row>
  </div>

  <div style="margin-left: 5px;margin-bottom: 5px">
    <a-button
      size="small"
      shape="circle"
      @click="handleAddNewJoinCondition"
    >
      <template #icon>
        <PlusOutlined />
      </template>
    </a-button>
  </div>
</template>
<script>
import {PlusOutlined, CloseOutlined} from '@ant-design/icons-vue';
import {v4 as uuidv4} from 'uuid';
import CONSTANTS from "@/constants"

const {QUERY_CONSTANT} = CONSTANTS

export default {

  components: {
    PlusOutlined,
    CloseOutlined,
    // DeleteOutlined

  },
  props: {
    value: {
      type: Object,
      default: () => ({})
    },
    joinableTableOptions: {
      type: Array,
      default: () => [],
    },
    mainTable: {
      type: Object,
      default: () => ({}),
    },
    nodeConnectedStructure: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["remove", "change"],
  data: function () {
    return {
      listJoinConditions: [],

    };
  },
  computed: {
    editDataLabel: () => ({
      label: "title",
      value: "title",
      children: "fields"
    }),

    joinedTableFieldOptions: function () {
      return this.nodeConnectedStructure.filter((table) => {
        return this.value.code.includes(table.title);
      });
    },

    JOIN_TYPE_OPTIONS: function () {
      const JOIN_TYPE = QUERY_CONSTANT.JOIN.JOIN_TYPE
      return Object.keys(JOIN_TYPE).map(key => ({
        title: JOIN_TYPE[key],
        value: JOIN_TYPE[key]
      }))
    }
  },
  watch: {
    value: {
      immediate: true,
      deep: true,
      handler() {
        this.listJoinConditions = this.value.on.map(e => {
          return {
            id: uuidv4(),
            data: e
          }
        })
      }
    }
  },

  methods: {
    handleJoinTableChange: function (val) {

      this.$emit("change", {
        ...this.value,
        code: val,
        on: []
      })
    },

    handleAddNewJoinCondition: function () {
      this.listJoinConditions.push({
        id: uuidv4(),
        data: {
          field1: [],
          field2: []
        },
      })
      const onConditions = this.listJoinConditions.map(e => e.data)

      this.updateValueChange({on: onConditions})
    },

    handleJoinTypeChange: function (val) {

      this.$emit("change", {
        ...this.value,
        type: val
      })
    },

    handleRemoveJoinCondition: function (id) {
      this.listJoinConditions = this.listJoinConditions.filter(e => e.id !== id)
      const onConditions = this.listJoinConditions.map(e => e.data)

      this.updateValueChange({on: onConditions})

    },

    handleOnConditionField1Change(id, val) {
      const onConditions = this.listJoinConditions.map(e => {
        if (e.id === id) {
          e.data.field1 = val
        }
        return e.data
      })

      this.updateValueChange({on: onConditions})
    },

    handleOnConditionField2Change(id, val) {
      const onConditions = this.listJoinConditions.map(e => {
        if (e.id === id) {
          e.data.field2 = val
        }
        return e.data
      })

      this.updateValueChange({on: onConditions})
    },

    updateValueChange(value) {
      this.$emit("change", {
        ...this.value,
        ...value
      })
    }

  },
};
</script>
