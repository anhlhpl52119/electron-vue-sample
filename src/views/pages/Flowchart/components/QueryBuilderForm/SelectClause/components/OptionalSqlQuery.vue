<template>
  <a-divider orientation="left">
    SQL Query Optional
  </a-divider>
  <br>
  <a-textarea
    v-model:value="value"
    placeholder="Input SQL Builder"
    :rows="15"
  />
</template>
<script>

export default {
  data: function () {
    return {
      value: "",
    };
  },
  computed: {},
  methods: {},
};
</script>
