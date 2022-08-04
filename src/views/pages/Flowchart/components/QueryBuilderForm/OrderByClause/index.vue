<template>
  <div>
    <div
      v-for="item in sorters"
      :key="item.key"
      style="display: flex; margin: 5px 0 5px 0; align-items: center"
    >
      <OrderByOption
        :value="item"
        style="width: 100%"
        :table-field-options="tableFieldOptions"
        :operator-options="operatorOptions"
        @change="handleOrderByOptionChange"
      />

      <a-button
        type="primary"
        shape="circle"
        style="margin: 0 5px 0 10px"
        size="small"
        danger
        @click="_ => sorters = sorters.filter(e => e.key !== item.key)"
      >
        <template #icon>
          <CloseOutlined />
        </template>
      </a-button>
    </div>
  </div>
  <div>
    <a-button
      type="primary"
      shape="circle"
      @click="handleAddOrderBtnClick"
    >
      <template #icon>
        <PlusOutlined />
      </template>
    </a-button>
  </div>
</template>
<script>
import CONSTANTS from "@/constants/index.js"
const { QUERY_CONSTANT } = CONSTANTS

import { v4 as uuidv4 } from 'uuid';

import OrderByOption from "./components/OrderByOption.vue";
import { PlusOutlined, CloseOutlined} from '@ant-design/icons-vue';



export default {
  components: {
    OrderByOption,
    PlusOutlined,
    CloseOutlined
  },
  props: {
    chosenNodeDatas: {
      type: Array,
      default: _ => []
    },

    value: {
      type: Array,
      default: _ => []
    }
  },
emits: ['update:value'],
  data: function () {
    return {
      sorters: []
    };
  },

  computed: {
    operatorOptions: () => {
      return Object.keys(QUERY_CONSTANT.ORDER.OP).map(key => {
        return {
          value: QUERY_CONSTANT.ORDER.OP[key],
          label: QUERY_CONSTANT.ORDER.OP[key],
          key: uuidv4()
        }
      })
    },

    tableFieldOptions: function() {
      const output = this.chosenNodeDatas.map(nodeData => {
        return {
          value: nodeData.code,
          label: nodeData.code,
          children: nodeData.select.map(selectField => {
            return {
              value: selectField.alias,
              label: selectField.alias,
            }
          })
        }
      })

      return output
     
    }
  },
  watch: {

    value: {
      deep: true,
      immediate: true,
      handler() {
        this.sorters = this.value

      }
    }
  },

  methods: {
    updateValue() {
        this.$emit("update:value", this.sorters.filter(sorter => !!sorter.field))

    },

    handleAddOrderBtnClick: function () {
      
      this.sorters = [...this.sorters, {
        key: uuidv4(),
        table: '',
        field: '',
        op: QUERY_CONSTANT.ORDER.OP.ASC
      }]
    },

    handleOrderByOptionChange(e) {
      this.sorters = this.sorters.map(item => {
        if(item.key === e.key) {
          return e
        }
        return item
      })
      this.updateValue()
    }
  }
};
</script>
