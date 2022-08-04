<template>
  <div>
    <a-radio-group :options="plainOptions" v-model:value="value1" />
    <br>
  </div>
</template>
<script>

import { ref } from "vue";
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
};
</script>
