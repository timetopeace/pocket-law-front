import { Module } from 'vuex'
import { actions } from './actions'
import { RootState } from '@/store'
import { Order } from './interfaces'

export interface OrdersState {
  orders: Order[]
  ordersCount: number
}

const state: OrdersState = {
  orders: [],
  ordersCount: -1
}

export const store: Module<OrdersState, RootState> = {
  state,
  mutations: {
    setOrders (state, value) {
      state.orders = value
    },
    setOrdersCount (state, value) {
      state.ordersCount = value
    }
  },
  actions,
  namespaced: true
}
