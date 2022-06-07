import store from '@/store'
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Routes from './routes'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Main',
    redirect: Routes.orders.list
  },
  {
    path: Routes.auth.base,
    name: 'Auth',
    component: () => import('@/views/Auth.vue'),
    meta: { noGuard: true }
  },
  {
    path: Routes.users.base,
    name: 'Clients',
    component: () => import('@/views/clients/Clients.vue'),
  },
  {
    path: Routes.orders.base,
    name: 'Orders',
    redirect: Routes.orders.list,
    component: () => import('@/views/orders/Orders.vue'),
    children: [
      {
        path: Routes.orders.list,
        name: 'OrdersList',
        component: () => import('@/views/orders/OrdersList.vue')
      },
      {
        path: `${Routes.orders.edit}/:id?`,
        name: 'OrdersEdit',
        component: () => import('@/views/orders/OrdersEdit.vue'),
        props: true
      }
    ]
  },
  {
    path: '/:catchAll(.*)',
    name: '404',
    component: () => import('@/views/404.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  if (store.getters.accessToken && to.path === Routes.auth.base) {
    next({ path: '/' })
    return
  }
  if (!to.meta.noGuard && !store.getters.accessToken) {
    next({ path: Routes.auth.base })
    return
  }
  next()
})

export default router
