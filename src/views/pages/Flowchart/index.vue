<template>
  <div class="page-container">
    <div
      style="height: 100%; display: flex; "
      class="width-full"
    >
      <div
        :style="`flex: 1; overflow: hidden`"
        class="width-full flex"
      >
        <FlowDesignMenu style="width: 250px; " />
        
        <div style="flex: 1; display: flex; flex-direction: column ;">
          <Graph style="flex: 1" />
          <!-- <div style="width: 100%; height: 300px; background: red"></div> -->
              
          <!-- <BottomDrawer
            :style="`width: 100%; flex: 0 0 ${bottomDrawer.isOpen ? '300' :'200'}px; background: pink`"
            @toggle="handleBottomDrawerToggle"
          /> -->
        </div>
      </div>
    </div>

    <RightDrawerContainer />
  </div>
</template>

<script>
import Graph from "./layout/Graph"

import { NAMESPACE } from "@/views/pages/Flowchart/store"
import { mapActions } from "vuex" 

import FlowDesignMenu from "./layout/FlowDesignMenu"
import RightDrawerContainer from "./layout/RightDrawerContainer"
import BottomDrawer from "./layout/BottomDrawer"

export default {
 components: {
    Graph, 
    FlowDesignMenu, RightDrawerContainer, 
    // BottomDrawer
 },
 data() {
   return {
    bottomDrawer: {
      isOpen: true
    }
  }
 },
 async created() {
    this.loadImportedTables()
 },
 methods: {
   ...mapActions(`${NAMESPACE}/MASTER_DATA`, [
     'loadImportedTables'
   ]),

   handleBottomDrawerToggle() {
     this.bottomDrawer.isOpen = !this.bottomDrawer.isOpen
   }
 }
}
</script>

<style lang="scss" scoped>
.page-container {
  height: 100%; 
  width: 100%;
}

.flex-column{
  display: flex;
  flex-direction: column;
}

.flex {
  display: flex;
}

.width-full {
  width: 100%;
}


</style>