<template>
  <div class="container">
    <a-button @click="$emit('toggle')">
      toggle
    </a-button>
  </div>
</template>

<script>
export default {
emits: ['toggle']

}
</script>
<style lang="scss" scoped>
.container {
  width: 100%;
  border: 1px solid #979797;
}
</style>