<template>
  <a-layout style="min-height: 100vh">
    <!-- <LeftMenu /> -->
    <a-layout>
      <a-layout-content
        :style="{ background: '#fff', height: '100vh' }"
      >
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script>
// import LeftMenu from "./components/LeftMenu"

export default {

  components: {
    // LeftMenu,
  },
  // created() {
  //   this.$router.push("/flowchart")
  // }

}
</script>