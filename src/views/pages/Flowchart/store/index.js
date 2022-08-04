
import actions from "./actions/index.js"
import State from "./state"
import mutations from "./mutations/index"
import getters from "./getters"

import modules from "./modules/index"

export const NAMESPACE = "MAIN_FLOW_DESIGN_PAGE"

export default {
  namespaced: true,
  state: State,
  mutations: mutations,
  actions: actions,
  getters: getters,
  modules: modules
}