import {
  createStore
} from 'vuex';
import Global from "./global"

import MainDesignFlowPageStore, {
  NAMESPACE as MAIN_DESIGN_FLOW_PAGE_NAMESPACE
} from "@/views/pages/Flowchart/store/index"


const modules = {
  "global": Global,
  [MAIN_DESIGN_FLOW_PAGE_NAMESPACE]: MainDesignFlowPageStore
}

export default createStore({
  modules,
  getters: {},

})