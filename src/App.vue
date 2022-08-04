<template>
  <!-- <img alt="Vue logo" src="./assets/logo.png">
  <HelloWorld msg="Welcome to Your Vue.js App"/> -->
  <router-view />
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'


export default {
  name: "App", 
  
  // components: {
  //   HelloWorld
  // }
  mounted: function() {

  }
};
</script>

<style lang="scss">
/* #app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  
} */

html {
  // overflow: hidden;

  * {
    // font-size: .94rem !important;

  }

}


::-webkit-scrollbar {
    background-color: #fff;
    width: 16px;
}

::-webkit-scrollbar-track {
    background-color: #fff;
}

::-webkit-scrollbar-thumb {
    background-color: #babac0;
    border-radius: 16px;
    border: 4px solid #fff;
}

::-webkit-scrollbar-button {
    display:none;
}


</style>
