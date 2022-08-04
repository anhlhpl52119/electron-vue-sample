<template>
  <a-radio-group 
    v-model:value="valueRadio"
    :options="plainOptions"
  />
  <div
    v-if="valueRadio === 'Field Optional'"
    class="inner-right"
  >
    <TableColumnSelection
      :value="value"
      :chosen-node-datas="chosenNodeDatas"
      @change="handleTableColumnSelectionChange"
    />
  </div>

  <div v-if="valueRadio === 'SQL Query Optional'">
    <OptionalSqlQuery />
  </div>
</template>
<script>
import OptionalSqlQuery from "./components/OptionalSqlQuery.vue";
import TableColumnSelection from "./components/TableColumnSelection.vue";

export default {
  components: {
    OptionalSqlQuery,
    TableColumnSelection
  },
  props: {

    value: {
      type: Array,
      default: _ => []
    },
    chosenNodeDatas: {
      type: Array,
      default: _ => []
    }
  },
  emits: ["change"],
  data: function () {
    return {
      outputSelectClause: [],
      selectType: "",
      isDisplayOptionalDrawer: false,
      plainOptions: ["Field Optional", "SQL Query Optional"],
      valueRadio: "Field Optional",
    };
  },

  methods: {

    handleTableColumnSelectionChange(val) {
      console.log("handleChange", val)

      this.$emit("change", val);
    }
  },
};
</script>
