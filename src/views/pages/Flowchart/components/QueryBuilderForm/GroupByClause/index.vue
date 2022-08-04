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
  </div>
</template>
<script>
import { defineComponent, ref } from "vue";
const plainOptions = ["Single", "Statement"];
const options = [
  {
    label: "Single",
    value: "Single",
  },
  {
    label: "Statement",
    value: "Statement",
  },
];
export default {
  data() {
    const value1 = ref("Single");
    return {
      plainOptions,
      options,
      value1,
    };
  },
  methods(){

  }
};
</script>
