<template>
  <div
    class="container animation-open"
    :style="{width: `${width}px`, display: `${visible ? 'flex' : 'none'}`}"
  >
    <ToggleButton 
      :is-folded="isOpen"
      @click="handleToggleBtnClick"
    />
      
    <div
      v-show="isOpen"
      class="wrapper"
    >
      <div
        v-if="!!title"
        class="title"
      >
        <a-typography-title
          :level="4"
          :content="title"
        />
        <a-divider />
      </div>

     
      <div class="content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
import ToggleButton from "./ToggleButton.vue"

const DEFAULT_WIDTH = 500;

export default {
  components: {
    ToggleButton
  },
  props: {
    visible: {
      type: Boolean,
      default : false
    },

    isOpen: {
      type: Boolean,
      default: false
    },

    title: {
      type: String,
      default: ""
    }
  },
  emits: ['update:is-open'],
  data() {
    return {
      width: 0,
    }
  },

  watch: {
    isOpen(val) {
      if(val) {
        this.width = DEFAULT_WIDTH

      } else {
        this.width = 0
      }
    }
  },

  methods: {
    handleToggleBtnClick() {
      this.$emit("update:is-open",!this.isOpen ) 
    },

  }
}
</script>

<style lang="scss" scoped>
.container {
  width: 300px;
  height: 100%;
  position: fixed;
  top: 0;
  right: 0;
  z-index: 1000;
  background: #fff;
  border: 1px solid rgb(179, 179, 179);


}

.animation-open {
  transition: width .4s;
}

.title {
  text-align: center;
  margin: 10px 0 0 0;
}

.wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  white-space: nowrap;
  align-items: stretch;
  overflow: hidden;
}

.content {
  margin: 10px 15px 10px 15px;
  flex: 1;
  overflow-y: auto;
}
</style>