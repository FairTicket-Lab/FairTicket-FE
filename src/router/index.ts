import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/',
      name: 'intro',
      component: () => import('@/views/IntroPage.vue'),
      meta: { fullscreen: true },
    },
    {
      path: '/concerts',
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
    {
      path: '/lottery/:concertId',
      name: 'lottery',
      component: () => import('@/views/LotteryPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/seats/:concertId',
      name: 'seats',
      component: () => import('@/views/SeatsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/payment/result',
      name: 'payment-result',
      component: () => import('@/views/PaymentResultPage.vue'),
    },
    {
      path: '/payment/:reservationId',
      name: 'payment',
      component: () => import('@/views/PaymentPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/my/tickets',
      name: 'my-tickets',
      component: () => import('@/views/MyTicketsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundPage.vue'),
    },
  ],
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !localStorage.getItem('access_token')) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
})

export default router
