<template lang="pug">
.orders-list(v-if="finishedLoading")
  HeadingWithControls(:heading="'Список заказов'").mb-20
  .d-flex
    UiSearchBar.mb-20(
      @search="onSearch"
    ).mr-10
      .mr-10(v-if="getStoreFilterOptions.length")
        .mb-5.ml-10 Магазин
        UiDropdown(
          :nullOption="{ label: 'Любой' }"
          :canSelectNull="true"
          :options="getStoreFilterOptions"
          :searchable="true"
          v-model="filters.selectedStore"
        )
      .ml-40.mr-40(v-else)
        .loading.loading--smaller
      .mr-10
        .mb-5.ml-10 Статус
        UiDropdown(
          :nullOption="{ label: 'По умолчанию' }"
          :canSelectNull="true"
          :options="getStatusFilterOptions"
          :isMultiChoice="true"
          v-model="filters.selectedStatuses"
        )
    .mr-10(v-if="staffProfile.groups.includes('Кассир/менеджер')")
      .mb-10 Уведомления о новых заказах
      .button.button-blue(v-if="isSubscribedToStoreNotifications" @click="toggleNotificationsSubscription") Отписаться
      .button.button-blue(v-else @click="toggleNotificationsSubscription") Подписаться
  table.list-table.list-table--clickable.mb-20
    thead
      tr
        th Номер
        th Статус
        th Сумма
        th Кол-во позиций
        th Магазин
        th Время самовывоза (местное)
    tbody
      tr(
        v-for="order in orders"
        :class="{ 'list-table__highlighted': isOrderNewAndUnchecked(order.id) }"
      )
        th
          RouterLink(:to="`${this.$routes.orders.edit}/${order.id}`") {{ order.number }}
        th
          RouterLink(:to="`${this.$routes.orders.edit}/${order.id}`")
            span(:style="{ 'color': getStatusForAny('orders', order.status).color }" :title="getStatusForAny('orders', order.status).title")
              | {{ getStatusForAny('orders', order.status).name }}
        th
          RouterLink(:to="`${this.$routes.orders.edit}/${order.id}`") {{ order.total.toLocaleString('ru-RU', {style: 'currency', currency: 'RUB' }) }}
        th
          RouterLink(:to="`${this.$routes.orders.edit}/${order.id}`") {{ order.orderItems.length }}
        th
          RouterLink(:to="`${this.$routes.orders.edit}/${order.id}`") {{ order.storeAddress || '-' }}
        th
          RouterLink(:to="`${this.$routes.orders.edit}/${order.id}`") {{ getFormattedDateTime(order.pickupTime) }}
  UiPagination(
    ref="pagination"
    :uniqueName="'orders'"
    :allItemsCount="ordersCount"
    :loadedItemsCount="orders.length"
    :setItemsAction="setOrders"
    :loadAction="loadOrders"
    :setItemsCountAction="setOrdersCount"
    :searchParams="getFilters"
    :customItemsPerPage="10"
    :loadByScrolling="false"
  )
.loading(v-else)
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import HeadingWithControls from '@/components/modules/HeadingWithControls.vue'
import UiSearchBar from '@/components/ui/UiSearchBar.vue'
import UiDropdown, { LabelValuePair } from '@/components/ui/UiDropdown.vue'
import UiPagination from '@/components/ui/UiPagination.vue'
import CardItem from '@/components/modules/CardItem.vue'
import { getTranslatedStatusForOrder } from '@/utils/helpers/helpFunctions'
import { LocalNotification, Store } from '@/store/interfaces'
import { OrderRequestParams } from './store/interfaces'
import { OrderStatus } from '@/interfaces'

export default defineComponent({
  name: 'OrdersList',
  components: {
    HeadingWithControls,
    UiSearchBar,
    UiDropdown,
    CardItem,
    UiPagination
  },
  watch: {
    localNotifications (val: LocalNotification[], oldVal: LocalNotification[]) {
      // Получаем постоянные, не пропадающие уведомления.
      const prevNotifications = oldVal.filter(n => n.duration < 0).length
      const newNotifications = val.filter(n => n.duration < 0).length

      // Появились новые постоянные уведомления.
      if (newNotifications > prevNotifications) {
        const pagination = (this.$refs.pagination as any)
        pagination.resetPagination()
      }
    }
  },
  data () {
    return {
      filters: {
        selectedStore: null as Store | null,
        selectedStatuses: [] as OrderStatus[]
      }
    }
  },
  computed: {
    getStoreFilterOptions (): LabelValuePair<Store> {
      const stores = this.profileStores.length ? this.profileStores : this.stores
      return stores.map((s: Store) => { return { label: s.address, value: s } })
    },
    getStatusFilterOptions (): LabelValuePair<string>[] {
      return [
        this.hasPermission('catalog', 'view_draft_order')
          ? {
            label: getTranslatedStatusForOrder('draft').name,
            value: 'draft'
          } : undefined,
        this.hasPermission('catalog', 'view_processed_order')
          ? {
            label: getTranslatedStatusForOrder('processed').name,
            value: 'processed'
          } : undefined,
        this.hasPermission('catalog', 'view_processed_order')
          ? {
            label: getTranslatedStatusForOrder('alert').name,
            value: 'alert'
          } : undefined,
        this.hasPermission('catalog', 'view_ready_order')
          ? {
            label: getTranslatedStatusForOrder('ready').name,
            value: 'ready'
          } : undefined,
        this.hasPermission('catalog', 'view_closed_order')
          ? {
            label: getTranslatedStatusForOrder('closed').name,
            value: 'closed'
          } : undefined,
        this.hasPermission('catalog', 'view_canceled_order')
          ? {
            label: getTranslatedStatusForOrder('canceled').name,
            value: 'canceled'
          } : undefined
      ].filter(i => !!i)
        .map(i => i!)
        .map(s => { return { label: s.label.charAt(0).toUpperCase() + s.label.slice(1), value: s.value } })
    },
    getFilters () {
      const params = {} as OrderRequestParams
      if (this.filters.selectedStore) params.store = this.filters.selectedStore.id
      if (this.filters.selectedStatuses.length) params.status = this.filters.selectedStatuses
      return params
    },
    isSubscribedToStoreNotifications () {
      const savedValue = localStorage.getItem('isSubscribedToStoreNotifications')
      return savedValue === 'true'
    },
    ...mapGetters(['hasPermission']),
    ...mapState(['profileStores', 'stores', 'localNotifications', 'staffProfile']),
    ...mapState('orders', ['orders', 'ordersCount'])
  },
  methods: {
    isOrderNewAndUnchecked (orderId: string) {
      return (this.localNotifications as LocalNotification[]).filter(n => n.meta === orderId).length
    },
    onSearch () {
      const pagination = (this.$refs.pagination as any)
      pagination.resetPagination()
    },
    async toggleNotificationsSubscription () {
      let result
      if (!this.isSubscribedToStoreNotifications) {
        if (!confirm(`Вы уверены, что хотите подписаться на уведомления о новых заказах в магазине ${this.profileStores[0].address}?`)) return
        this.finishedLoading = false
        result = await this.subscribeToStoreNotifications()
        if (result !== null) {
          if (result.code === 'messaging/permission-default') {
            alert('Для подписки на уведомления необходимо разрешить их показ в браузере. Попробуйте снова.')
          } else if (result.code === 'messaging/permission-blocked') {
            alert(`Вы заблокировали показ уведомлений в браузере или на сайте ${window.location.origin}
Для продолжения разрешите показ уведомлений в настройках браузера (chrome://settings/content/notifications) и попробуйте снова.`)
          }
        }
      } else {
        if (!confirm('Вы уверены, что хотите отписаться от уведомлений о новых заказах?')) return
        this.finishedLoading = false
        await this.unsubscribeFromStoreNotifications()
      }
      location.reload()
      this.finishedLoading = true
    },
    ...mapMutations('orders', ['setOrders', 'setOrdersCount']),
    ...mapActions(['loadStores']),
    ...mapActions('orders', ['loadOrders', 'subscribeToStoreNotifications', 'unsubscribeFromStoreNotifications'])
  },
  async mounted () {
    await this.loadStores()
    this.finishedLoading = true
  }
})
</script>
