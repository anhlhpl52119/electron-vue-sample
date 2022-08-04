<template>
  <a-button
    class="toggle-btn"
    type="primary"
    size="large"
    @click="handleClick"
  >
    <template #icon>
      <MenuUnfoldOutlined v-if="isFolded" />
      <MenuFoldOutlined v-else />
    </template>
  </a-button>
</template>
<script>

import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons-vue';



export default {
  components: {
    MenuUnfoldOutlined,
    MenuFoldOutlined
  },

  props: {
    isFolded: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click'],

  methods: {
    handleClick(e) {
      this.$emit("click", e)
    }
  }
}
</script>

<style lang="scss" scoped>
.toggle-btn{
  position: absolute;
  left: -40px;
  top: 15px;
}
</style>