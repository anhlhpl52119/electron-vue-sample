<template>
  <div>
    <a-cascader
      :show-search="true"
      :value="tableFieldValue"
      size="small"
      style="width: calc( 100% - 100px)"
      :options="tableFieldOptions"
      @change="handleFieldChange"
    />

    <a-select
      :value="value.op"
      size="small"
      style="width: 100px"
      :options="operatorOptions"
      @change="handleOpChange"
    />
  </div>
</template>
<script>


export default {
  props: {
    value: {
      type: Object,
      default: _ => ({
        table: '',
        field: '',
        op: ''
      })
    },

    operatorOptions: {
      type: Array,
      default: _ => []
    },

    tableFieldOptions: {
      type: Array,
      default: _ => []
    }

  },
  emits: ['change'],
  data: function () {
    return {
    };
  },
  computed: {
    filterOption: (input, option) => {
      return option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    },

    tableFieldValue: function() {
      if(this.value?.field && this.value?.table) {
        return [this.value.table, this.value.field]
      }
      return []
    }
  },
  methods: {
    handleFieldChange(val) {

      this.$emit("change", {
        ...this.value,
        field: val[1],
        table: val[0]
      })
    },

    handleOpChange(val) {
      this.$emit("change", {
        ...this.value,
        op: val
      })
    }
  }
};
</script>
