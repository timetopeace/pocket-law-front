import { AuthParams, UserProfile, PaginationParams, Ban } from './interfaces'
import { fetchRequest } from '@/requests/requestMachine'
import store, { RootState } from '@/store/index'
import { getDateFormatted } from '@/utils/helpers/helpFunctions'
import { ActionTree } from 'vuex'

export const actions: ActionTree<RootState, RootState> = {
  async login ({}, payload: AuthParams) {
    const response = await fetchRequest('auth/staff/login', 'POST', false, payload, { disabledErrorCodes: [401] })
    return response
  },
  async refreshToken ({ commit }) {
    const refreshToken = store.getters.refreshToken
    const response = await fetchRequest('auth/token/refresh', 'POST', false, { refresh: refreshToken })
    commit('setAccessToken', response.body.access)
    commit('setRefreshToken', response.body.refresh)
  },
  async loadClients ({ commit }, params: PaginationParams) {
    const response = await fetchRequest('auth/clients', 'GET', true, params)
    const clients = (response.body.results as UserProfile[])
    // Parse the date to 'yyyy-MM-dddd' format.
    clients.forEach(c => { c.createdAt = getDateFormatted(c.createdAt as string, '.', '-') })
    commit('setClients', clients)
    commit('setClientsCount', response.body.count)
  },
  async loadClientById ({}, id: number) {
    const response = await fetchRequest(`auth/clients/${id}`, 'GET', true)
    return response.body
  },
  async loadProductDescriptionNextPage ({ rootState }, customParams: any) {
    if (rootState.productDescriptionPagination.finishedLoadingAllItems) return
    const params = {
      limit: rootState.productDescriptionPagination.limit,
      offset: rootState.productDescriptionPagination.offset,
      ...customParams
    }
    const response = await fetchRequest('catalog/products/descriptions', 'GET', true, params)
    rootState.productDescriptionPagination.value = [...rootState.productDescriptionPagination.value, ...response.body.results]
    rootState.productDescriptionPagination.offset += rootState.productDescriptionPagination.limit
    if (rootState.productDescriptionPagination.value.length >= response.body.count) {
      rootState.productDescriptionPagination.finishedLoadingAllItems = true
    }
  },
  async loadProductNextPage ({ rootState }, customParams: any) {
    if (rootState.productPagination.finishedLoadingAllItems) return
    const params = {
      limit: rootState.productPagination.limit,
      offset: rootState.productPagination.offset,
      ...customParams
    }
    const response = await fetchRequest('catalog/products', 'GET', true, params)
    rootState.productPagination.value = [...rootState.productPagination.value, ...response.body.results]
    rootState.productPagination.offset += rootState.productPagination.limit
    if (rootState.productPagination.value.length >= response.body.count) {
      rootState.productPagination.finishedLoadingAllItems = true
    }
  },
  async loadProducts ({}, params: any) {
    const response = await fetchRequest('catalog/products', 'GET', true, params)
    return response.body.results
  },
  async loadStores ({ commit }, params: any) {
    const response = await fetchRequest('catalog/stores', 'GET', true, params)
    commit('setStores', response.body)
  },
  async loadNewOrders ({ commit, rootState }, lastUpdate: Date) {
    const response = await fetchRequest('catalog/orders', 'GET', true, { updated_after: lastUpdate, status: 'processed' })
    if (store.hasModule('orders')) {
      commit('orders/setOrdersCount', (rootState as any).orders.ordersCount + response.body.length)
    }
    return response.body
  },
  async loadStaffProfile ({ commit }) {
    const response = await fetchRequest('auth/staff/profile/my', 'GET', true)
    commit('setStaffProfile', response.body)
  },
  async loadProfileStores ({ commit }) {
    const response = await fetchRequest('auth/staff/profile/my/stores', 'GET', true)
    commit('setProfileStores', response.body)
  },
  async banUser ({}, ban: Ban) {
    const response = await fetchRequest('bans', 'POST', true, ban)
    return response
  },
  async unbanUser ({}, banId: string) {
    const response = await fetchRequest(`bans/${banId}`, 'PATCH', true, { isActive: false })
    return response
  },
  async changeUserBan ({}, { banId, ban }) {
    const response = await fetchRequest(`bans/${banId}`, 'PUT', true, ban)
    return response
  }
}
