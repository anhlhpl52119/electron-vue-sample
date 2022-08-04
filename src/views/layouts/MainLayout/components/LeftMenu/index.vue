<template>
  <a-layout-sider>
    <div class="logo" />
    <a-menu 
      :selected-keys="selectedKeys"
      theme="dark"
      mode="inline"
    >
      <template 
        v-for="(menuItem, key) in menuItems" 
        :key="`menu-item-key-${key}`"
      >
        <a-sub-menu 
          v-if="menuItem.childrens"
          :key="key"
        >
          <template #title>
            <span>
              <!-- <a-icon
                v-if="menuItem.icon"
                :type="menuItem.icon" 
              /> -->
              {{ menuItem.name }}
            </span>
          </template>

          <a-menu-item 
            v-for="(childItem) in menuItem.childrens" 
            :key="childItem.link"
          >
            <router-link
              :to="childItem.link"
            >
              {{ childItem.name }}
            </router-link>
          </a-menu-item>
        </a-sub-menu>


        <template v-else>
          <a-menu-item :key="menuItem.link">
            <router-link
              :to="menuItem.link"
            >
              {{ menuItem.name }}
            </router-link>
          </a-menu-item>
        </template>
      </template>
    </a-menu>
  </a-layout-sider>
</template>


<script>
import MENU_ITEMS from "@/config/menu"
// import { Icon as AIcon } from 'ant-design-vue';
export default {
  components:{
    // AIcon
  },
  setup() {
    
  },
  data: function(){
    return {
      collapsed: false,
      selectedKeys: []
    }
  },
  computed: {
    menuItems: function () {
      return MENU_ITEMS
    }
  },
  watch: {
    '$route'(to) {
      this.selectedKeys = [to.path]
    }
  }
}
</script>