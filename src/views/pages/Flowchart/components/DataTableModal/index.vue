<template>
  <a-modal
    :visible="visible"
    title="Data Table"
    :footer="null"
    @cancel="_ => $emit('close')"

  >
    <div class="modal-content">
      <Main @change="handleDataTableDialogDataChange"/>
    </div>
  </a-modal>
</template>

<script>
import Main from "./main.vue"
export default {
  components: {
    Main
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'change'],
  data() {
    return {

    }
  },

  methods: {
    handleDataTableDialogDataChange() {
     this.$emit("change")
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-content {
  // min-height: 70vh;
  // overflow: auto;
}
</style>