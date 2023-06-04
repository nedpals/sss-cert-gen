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
    name: 'verify-page',
    path: '/verify/:id',
    component: () => import('./pages/Verify.vue'),
    meta: {
      transition: 'fade'
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
  },
  {
    name: 'cert-with-id-page',
    path: '/cert/:id',
    component: () => import('./pages/CertificateScreen.vue'),
    meta: {
      transition: 'fade',
      guestOnly: true,
      pageTitle: 'Certificate Screen'
    }
  },
  {
    path: '*',
    redirect: '/'
  }
];

export const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const guestOnly = to.matched.some(record => record.meta.guestOnly);

  if (to.name === 'cert-with-id-page' && !authState.participantInfo.fromVerify) {
    // Go first to verify page to make sure the
    // certificate data of participant data is loaded
    return next({ name: 'verify-page', params: { id: to.params.id } });
  }

  if (guestOnly && authState.isAuthenticated) {
    if (authState.participantInfo.fromVerify) {
      return next();
    }
    next('/');
  } else if (requiresAuth && !authState.isAuthenticated) {
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
