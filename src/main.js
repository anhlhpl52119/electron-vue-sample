import { createApp } from 'vue'
import App from './App.vue'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
import "@/assets/fontawesome/css/all.css"

import Router from "@/routes";
import Store from "@/store"
// Vue.config.productionTip = false;

import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import db from "@/models"

const app = createApp(App)

app.use(VueSweetalert2);
app.use(Antd);
app.use(Router);
app.use(Store);

db.sync().then( _ => app.mount('#app'))




