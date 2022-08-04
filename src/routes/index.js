import {
  createRouter,
  createWebHashHistory
} from 'vue-router';
import NProgress from 'nprogress'; // progress bar
import 'nprogress/nprogress.css'; // progress bar style
NProgress.configure({
  showSpinner: false,
  easing: 'ease',
  speed: 1000
}); // NProgress Configuration





const routes = [{
    path: '/',
    component: () => import("@/views/layouts/MainLayout"),
    children: [{
        path: '',
        component: () => import("@/views/pages/Flowchart"),
      },
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/NotFoundPage'),
  }
]


const router = createRouter({
  scrollBehavior( /* to, from, savedPosition */ ) {
    return {
      top: 0
    }
  },
  history: createWebHashHistory(process.env.BASE_URL),
  routes: routes,
});

router.beforeEach(( /* to, from */ ) => {
  // start progress bar
  NProgress.start();
});

router.afterEach(() => {
  // finish progress bar
  NProgress.done();
});

export default router;