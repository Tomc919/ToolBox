import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/scan',
      name: 'scan',
      component: () => import('@/views/ScanView.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue')
    },
    {
      path: '/document',
      name: 'document',
      component: () => import('@/views/DocumentView.vue')
    }
  ]
})

export default router
