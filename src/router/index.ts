import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomePage.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginPage.vue'),
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/views/SignupPage.vue'),
    },
    {
      path: '/concerts/:id',
      name: 'concert-detail',
      component: () => import('@/views/ConcertDetailPage.vue'),
    },
    {
      path: '/queue/:concertId',
      name: 'queue',
      component: () => import('@/views/QueuePage.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !localStorage.getItem('access_token')) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
})

export default router
