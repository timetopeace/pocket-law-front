import { fetchRequest } from '@/requests/requestMachine'
import { OrdersState } from './'
import { ActionTree } from 'vuex'
import { RootState } from '@/store'
import { OrderPutRequest, OrderRequestParams } from './interfaces'
import firebase from 'firebase'

export const actions: ActionTree<OrdersState, RootState> = {
  async loadOrders ({ commit }, params: OrderRequestParams) {
    const response = await fetchRequest('catalog/orders', 'GET', true, params)
    commit('setOrders', response.body.results)
    commit('setOrdersCount', response.body.count)
    return response.body.results
  },
  async loadOrderById ({}, id: string) {
    const response = await fetchRequest(`catalog/orders/${id}`, 'GET', true)
    return response
  },
  async updateOrder ({}, order: OrderPutRequest) {
    const id = order.id
    order.id = undefined
    const response = await fetchRequest(`catalog/orders/${id}`, 'PUT', true, order)
    return response
  },
  async cancelOrder ({}, orderId: string) {
    const response = await fetchRequest('catalog/orders/cancel', 'POST', true, { order: orderId }, { paramsInLink: true })
    return response
  },
  async setOrderStatusReady ({}, orderId: string) {
    const response = await fetchRequest('catalog/orders/ready', 'POST', true, { order: orderId }, { paramsInLink: true })
    return response
  },
  async setOrderStatusClosed ({}, orderId: string) {
    const response = await fetchRequest('catalog/orders/close', 'POST', true, { order: orderId }, { paramsInLink: true })
    return response
  },
  async subscribeToStoreNotifications ({ rootState }) {
    const storeToSubscribeTo = rootState.profileStores[0]
    const messaging = firebase.messaging()
    try {
      await messaging.requestPermission()
      const token = await messaging.getToken()
      await fetch('https://iid.googleapis.com/iid/v1/' + token + '/rel/topics/store.' + storeToSubscribeTo.id, {
        method: 'POST',
        headers: new Headers({
          Authorization: 'key=' + (!process.env.VUE_APP_ENV || process.env.VUE_APP_ENV === 'development'
            ? process.env.VUE_APP_SERVER_KEY
            : process.env.VUE_APP_SERVER_KEY_PROD)
        })
      })
      localStorage.setItem('isSubscribedToStoreNotifications', 'true')
      return null
    } catch (e) {
      localStorage.removeItem('isSubscribedToStoreNotifications')
      return e
    }
  },
  async unsubscribeFromStoreNotifications ({}) {
    try {
      await firebase.messaging().deleteToken()
    } catch (e) { console.error(e) }
    localStorage.removeItem('isSubscribedToStoreNotifications')
  }
}
