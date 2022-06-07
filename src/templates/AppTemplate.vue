<template lang="pug">
.app-template
  UiNotifications
  SiteHeader
  SiteSideBar
  main.app-template__content(v-if="finishedLoading")
    slot
  .app-template__content.loading(v-else)
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapActions, mapMutations, mapState } from 'vuex'
import SiteHeader from '@/components/modules/SiteHeader.vue'
import SiteSideBar from '@/components/modules/SiteSideBar.vue'
import UiNotifications from '@/components/ui/UiNotifications.vue'
import firebase from 'firebase'
import { waitTheCondition } from '@/utils/helpers/helpFunctions'

export default defineComponent({
  name: 'AppTemplate',
  components: {
    SiteHeader,
    SiteSideBar,
    UiNotifications
  },
  data () {
    return {
      lastCheckDate: new Date(),
      timer: null as any
    }
  },
  computed: {
    ...mapState(['localNotifications'])
  },
  methods: {
    ...mapMutations(['pushNotification']),
    ...mapActions(['loadNewOrders', 'loadStaffProfile', 'loadProfileStores']),
    ...mapActions('orders', ['loadOrders'])
  },
  async mounted () {
    await waitTheCondition(() => !!firebase.apps.length, 100)
    const messaging = firebase.messaging()
    messaging.onMessage((message) => {
      const orderNumber = message.notification.body.split('\n')[0]
      const link = message.notification.body.split('\n')[1]
      this.pushNotification({
        title: orderNumber,
        action: () => { window.location.href = link },
        duration: -1
      })
    })
    await this.loadStaffProfile()
    this.loadProfileStores()
    this.finishedLoading = true
  }
})
</script>
