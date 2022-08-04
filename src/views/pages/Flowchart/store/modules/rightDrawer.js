


export default {
  namespaced: true,
  state: () => ({
    visible: false,
    isOpen: false
  }),

  mutations: {
    toggle(state, val) {
      state.isOpen = val
    },
    
    show(state) {
      state.visible = true
      state.isOpen = true
    },

    hide(state) {
      state.visible = false
      state.isOpen = false
      
    }
  },
  
}