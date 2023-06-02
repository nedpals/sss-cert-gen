// router
import { RouteRecordRaw, createRouter, createWebHistory } from 'vue-router';
import { analytics } from './firebase';
import { logEvent } from 'firebase/analytics';
import { __getCurrentUser, authState } from './store';
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('./pages/Home.vue'),
    meta: {
      transition: 'fade',
      pageTitle: 'Home Page'
    }
  },
  {
    path: '/cert',
    component: () => import('./pages/CertificateScreen.vue'),
    meta: {
      transition: 'fade',
      requiresAuth: true,
      pageTitle: 'Certificate Screen'
    }
  }
];

export const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, _, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  if (requiresAuth && !authState.isAuthenticated) {
    next('/');
  } else {
    if (import.meta.env.PROD) {
      logEvent(analytics, "page_view");
    }
    next();
  }
});

router.afterEach((to, from) => {
  if (!from) {
    to.meta.transitionName = '';
  }
});
