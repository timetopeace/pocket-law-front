import { createStore } from 'vuex'
import { actions } from '@/store/actions'
import { UserProfile, LocalNotification, Store, StaffProfile, ProductDescriptionPagination, ProductPagination } from './interfaces'

export interface RootState {
  accessToken: string
  refreshToken: string
  registeredModule: string | null
  clients: UserProfile[]
  clientsCount: number
  productPagination: ProductPagination
  productDescriptionPagination: ProductDescriptionPagination
  localNotifications: LocalNotification[]
  localNotificationsCounter: number
  stores: Store[]
  profileStores: Store[]
  staffProfile: StaffProfile
}

const state: RootState = {
  accessToken: '',
  refreshToken: '',
  registeredModule: null,
  clients: [],
  clientsCount: -1,
  productPagination: { limit: 50, offset: 0, value: [], finishedLoadingAllItems: false },
  productDescriptionPagination: { limit: 50, offset: 0, value: [], finishedLoadingAllItems: false },
  localNotifications: [],
  localNotificationsCounter: 0,
  stores: [],
  profileStores: [],
  staffProfile: {} as StaffProfile
}

export default createStore({
  state,
  getters: {
    accessToken (state) {
      const token = state.accessToken
      const tokenLocalStorage = localStorage.getItem('accessToken')
      if (tokenLocalStorage === 'refreshing') localStorage.setItem('accessToken', '')
      return token || tokenLocalStorage
    },
    refreshToken (state) {
      const token = state.refreshToken
      const tokenLocalStorage = localStorage.getItem('refreshToken')
      if (tokenLocalStorage === 'refreshing') localStorage.setItem('refreshToken', '')
      return token || tokenLocalStorage
    },
    getProductById: (state) => (id: string) => {
      return state.productDescriptionPagination.value.filter(p => p.id === id)[0] || {}
    },
    hasPermission: (state) => (section: string, permission: string) => {
      if (process.env.NODE_ENV === 'test') return true
      if (!state.staffProfile.permissions) return false
      return state.staffProfile.permissions
        .filter(p => p.startsWith(section))
        .filter(p => p.split('.')[1].includes(permission))
        .length > 0
    }
  },
  mutations: {
    setAccessToken (state, value) {
      state.accessToken = value
      localStorage.setItem('accessToken', value)
    },
    setRefreshToken (state, value) {
      state.refreshToken = value
      localStorage.setItem('refreshToken', value)
    },
    setRegisteredModule (state, value) {
      state.registeredModule = value
    },
    setClients (state, value) {
      state.clients = value
    },
    setClientsCount (state, value) {
      state.clientsCount = value
    },
    setProductPagination (state, value) {
      state.productPagination = value
    },
    resetProductPagination (state) {
      state.productPagination.offset = 0
      state.productPagination.value = []
      state.productPagination.finishedLoadingAllItems = false
    },
    setProductDescriptionPagination (state, value) {
      state.productDescriptionPagination = value
    },
    resetProductDescriptionPagination (state) {
      state.productDescriptionPagination.offset = 0
      state.productDescriptionPagination.value = []
      state.productDescriptionPagination.finishedLoadingAllItems = false
    },
    setStores (state, value) {
      state.stores = value
    },
    setProfileStores (state, value) {
      state.profileStores = value
    },
    pushNotification (state, value) {
      value.id = (state.localNotificationsCounter++)
      state.localNotifications.splice(0, 0, value)
    },
    removeNotificationById (state, value) {
      state.localNotifications = state.localNotifications.filter((item: LocalNotification) => item.id !== value)
    },
    setLocalNotifications (state, value) {
      state.localNotifications = value
    },
    setStaffProfile (state, value) {
      state.staffProfile = value
    }
  },
  actions
})
