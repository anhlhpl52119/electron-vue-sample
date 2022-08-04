<template>
  <a-layout-footer style="padding: 5px 5px">
    <div id="copyright">
      <a-typography-text type="secondary">
        ©2022 by @EBS.SAP . All Rights Reserved
        <br>
        v2.0.0
      </a-typography-text>
    </div>
  </a-layout-footer>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  components: {
  },
});
</script>

<style scoped>
#copyright {
  text-align: center;
}
</style>
