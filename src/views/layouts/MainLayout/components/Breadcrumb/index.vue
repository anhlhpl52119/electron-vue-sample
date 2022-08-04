<template>
  <a-breadcrumb
    separator=">"
    style="margin-left: 20px"
  >
    <a-breadcrumb-item
      v-for="(breadcrumb, key) of breadcrumbs"
      :key="key"
    >
      {{ breadcrumb.name }}
    </a-breadcrumb-item>
  </a-breadcrumb>
</template>


<script>
export default {

  props: {
    breadcrumbs: {
      type: Array,
      default: _ => []
    }
  },
  setup() {
    
  }
}
</script>


