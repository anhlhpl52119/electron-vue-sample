<template>
  <div class="menu-container">
    <div class="left-menu-group menu-group">
      <div
        class="menu-item zoom-on-hover"
        @click="_ => $emit('data-table-click')"
      >
        <a-tooltip placement="top">
          <template #title>
            <span>Import data table</span>
          </template>
          <i
            class="icon fa-solid fa-database"
            style="color: #6495ED"
          />
        </a-tooltip>
      </div>
    </div>

    <!-- <div class="right-menu-group menu-group">
      <div
        class="menu-item zoom-on-hover"
        @click="_ => $emit('export-click')"
      >
        <a-tooltip placement="top">
          <template #title>
            <span>Export</span>
          </template>
          <i
            class="fa-solid fa-file-export"
            style="font-size: 1.5em; color: hotpink"
          />
        </a-tooltip>
      </div>

      <div
        class="menu-item zoom-on-hover"
        @click="_ => $emit('import-click')"
      >
        <a-tooltip placement="top">
          <template #title>
            <span>Import</span>
          </template>
          <i
            class="fa-solid fa-file-import"
            style="font-size: 1.5em; color: #6495ED"
          />
        </a-tooltip>
      </div>
    </div> -->


  </div>
</template>
<script>
export default {
  components: {},
  emits: ['import-click', 'export-click', 'import-data-table-click', 'data-table-click']
}
</script>
 
<style lang="scss" scoped>
.menu-container {
  background: #f5f5f5;
  display: flex;
  justify-content: space-between;
  align-content: center;
  border-bottom: 1px solid #a8a8a8;
  line-height: 1.5;
  // padding: 5px 5px 3px 5px;
  
  .menu-group {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .left-menu-group {
  }

  .right-menu-group {
  }
}

.menu-item {
  margin: 2.5px ;
  height: 35px;
  width: 35px;

  display: flex;
  justify-content: center;
  align-items: center;
  
  border-radius: 10%;
  &:hover {
    cursor: pointer;
    background: white !important;
  }

  .icon {
    font-size: 1.5em;
  }
}

.zoom-on-hover{
    transition: transform .2s;

  &:hover{
    .icon {
      transform: scale(1.2);
    }
  }
}


</style>