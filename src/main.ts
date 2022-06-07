import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from '@/store'
import Routes from '@/router/routes'
import { getDateFormatted, getDateTimeFormatted, getGenderLetter, getStatusForAny, StatusType, trimString } from './utils/helpers/helpFunctions'
import { ItemStatus } from './interfaces'
import firebase from 'firebase'

const app = createApp(App).use(store).use(router)
app.config.globalProperties.$routes = Routes
app.mixin({
  data () {
    return {
      finishedLoading: false,
      isLoaded: {},
      pressedKeys: {}
    }
  },
  methods: {
    getTrimmedString (string: string, length: number = 80) {
      return trimString(string, length, true)
    },
    getGenderLetter (gender: string) {
      return getGenderLetter(gender)
    },
    getStatusForAny (statusType: StatusType, status: ItemStatus) {
      return getStatusForAny(statusType, status)
    },
    getFormattedDate (date: Date) {
      if (!date) return '-'
      return getDateFormatted(date.toString(), '.', '-')
    },
    getFormattedDateTime (date: Date, delimeter: string = '.', finalDelimeter: string = '-', UTCTimeZoneOffsetInMinutes: number | null = null) {
      if (!date) return '-'
      return getDateTimeFormatted(date.toString(), delimeter, finalDelimeter, UTCTimeZoneOffsetInMinutes)
    }
  },
  mounted () {
    window.onkeyup = (e: any) => { this.pressedKeys[e.code] = false }
    window.onkeydown = (e: any) => { this.pressedKeys[e.code] = true }
  }
})
app.mount('#app')

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $routes: any
    finishedLoading: boolean
    isLoaded: { [key: string]: boolean }
    pressedKeys: { [key: string]: boolean }
  }
}
