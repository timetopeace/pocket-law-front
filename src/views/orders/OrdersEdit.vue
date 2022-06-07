<template lang="pug">
.orders-edit.d-flex(v-if="finishedLoading")
  .mr-40
    h2.mb-20 Заказ
    .mb-20 Заказ №{{ order.number }}
    .mb-20 Наименование: {{ order.name }}
    .mb-20 Описание: {{ order.description }}
    .mb-20 Время создания: {{ getFormattedDateTime(order.pickupTime)}}
    .mb-40
      template(v-if="order.status === 'processed'")
        .button(v-if="hasPermission('catalog', 'ready_order')" @click="markOrderAsReady").mb-15 Отправить заказ
        .button.button-red(v-if="hasPermission('catalog', 'cancel_order')" @click="markOrderAsCancelled").mb-30 Отменить заказ
      h2.mb-20 Заказчик
      .mb-20 ФИО: {{ getClientFullName || '-' }}
      .mb-20 Дата рождения: {{ order.user.userProfile.birthday || '-' }}
      .mb-20 Email: {{ order.user.userProfile.email || '-' }}
      .mb-20 Номер телефона: {{ order.user.userProfile.phone || '-' }}
      BarcodeViewer(v-if="order.user.loyaltyProfile" :barcode="order.user.loyaltyProfile.barcode").d-justify-start.mb-20
    .button.button--regularly-wide(
      @click="saveOrder"
      v-if="canEditWithCurrentStatus"
      :class="{ 'button--disabled': !hasPermission('catalog', 'change_order') }"
    ) Сохранить заказ
  div
    HeadingWithControls(
      :heading="'Документы заказчика'"
      :controls="hasPermission('catalog', 'add_orderitem') && canEditWithCurrentStatus ? [{ type: 'plus', action: addGoodsToOrder }] : []"
    ).mb-20.d-justify-start
    table.list-table(v-if="order.orderItems.length")
      thead
        tr
          th Документ
      tbody
        tr(v-for="orderItem in order.orderItems")
          th
            GoodsItemComponent(
              :key="orderItem.id"
              :goodsItem="orderItem"
              :canDelete="hasPermission('catalog', 'delete_orderitem') && canEditWithCurrentStatus"
              :canChangeCount="hasPermission('catalog', 'change_orderitem') && canEditWithCurrentStatus"
              @update="onGoodsItemUpdate($event)"
              @delete="removeItem(orderItem)"
            )
  div
    HeadingWithControls(
      :heading="'Документы эксперта'"
      :controls="hasPermission('catalog', 'add_orderitem') && canEditWithCurrentStatus ? [{ type: 'plus', action: addGoodsToOrder }] : []"
    ).mb-20.d-justify-start
    table.list-table(v-if="order.orderItems.length")
      thead
        tr
          th Документ
      tbody
        tr(v-for="orderItem in order.orderItems")
          th
            GoodsItemComponent(
              :key="orderItem.id"
              :goodsItem="orderItem"
              :canDelete="hasPermission('catalog', 'delete_orderitem') && canEditWithCurrentStatus"
              :canChangeCount="hasPermission('catalog', 'change_orderitem') && canEditWithCurrentStatus"
              @update="onGoodsItemUpdate($event)"
              @delete="removeItem(orderItem)"
            )
.loading(v-else)
UiModal(
  :isShown="isGoodsModalShown"
  @close="onGoodsModalCancelClose"
  v-if="order && order.storeId"
)
  h2.mb-20 Выберите документ
  SelectProducts(
    v-model="productSelectedInModal"
    :isMultiChoice="false"
    :productFilterFunction="productFilterFunction"
    :loadItemsCustomParameters="{ store: order.storeId }"
  ).mb-20
  .d-justify-between
    .button.button-gray(@click="onGoodsModalCancelClose") Отменить
    .button(
      @click="onGoodsModalClose"
      :class="{ 'button--disabled': !productSelectedInModal }"
    ) Добавить
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import { Order, OrderItem, OrderPutRequest } from './store/interfaces'
import UiInput from '@/components/ui/UiInput.vue'
import UiDropdown from '@/components/ui/UiDropdown.vue'
import UiModal from '@/components/ui/UiModal.vue'
import SelectProducts from '@/components/modules/SelectProducts.vue'
import HeadingWithControls from '@/components/modules/HeadingWithControls.vue'
import GoodsItemComponent from '@/components/modules/GoodsItem.vue'
import BarcodeViewer from '@/components/modules/BarcodeViewer.vue'
import { ProductOrderItem, LocalNotification, Product, ProductDescription } from '@/store/interfaces'
import { RequestMachineResponse } from '@/requests/requestMachine'

export default defineComponent({
  name: 'OrdersEdit',
  components: {
    UiDropdown,
    UiInput,
    UiModal,
    SelectProducts,
    HeadingWithControls,
    GoodsItemComponent,
    BarcodeViewer
  },
  props: {
    id: {
      type: String
    }
  },
  data () {
    return {
      order: null as Order | null,
      selectedOrderNumber: 0,
      isGoodsModalShown: false,
      productSelectedInModal: null as Product | null,
      errors: ''
    }
  },
  computed: {
    productFilterFunction () {
      return (p: Product | ProductDescription) => !this.order?.orderItems.map(i => i.id).includes(p.id)
    },
    selectedOrder (): OrderItem {
      return this.order?.orderItems[this.selectedOrderNumber]! || {}
    },
    getClientFullName (): string {
      return [this.order?.user.userProfile.lastName, this.order?.user.userProfile.firstName, this.order?.user.userProfile.patronymicName].join(' ').trim()
    },
    canEditWithCurrentStatus (): boolean {
      return !['canceled', 'closed'].includes(this.order!.status)
    },
    ...mapGetters(['hasPermission']),
    ...mapState(['localNotifications'])
  },
  methods: {
    async saveOrder () {
      if (!this.hasPermission('catalog', 'change_order')) return
      this.finishedLoading = false
      const orderToSend = {
        id: this.id,
        orderItems: this.order?.orderItems.map(i => {
          return {
            id: (i.product as Product).productDescription ?? (i.product as ProductDescription).id,
            quantity: i.quantity,
            priceValue: 0
          }
        })
      } as OrderPutRequest
      const response = await this.updateOrder(orderToSend)
      this.finishedLoading = true
      if (response.isSuccessful) {
        this.$router.push(this.$routes.orders.list)
        this.pushNotification({
          title: 'Заказ успешно обновлён'
        })
        this.$emit('test$orderEdited')
      }
    },
    addGoodsToOrder () {
      this.isGoodsModalShown = true
    },
    onGoodsModalCancelClose () {
      this.productSelectedInModal = null
      this.isGoodsModalShown = false
    },
    async onGoodsModalClose () {
      if (!this.productSelectedInModal) return
      this.isGoodsModalShown = false
      const selectedProduct = this.productSelectedInModal
      this.productSelectedInModal = null
      if (!selectedProduct) return
      this.order!.orderItems.push({
        id: selectedProduct.id,
        name: selectedProduct.name,
        priceValue: selectedProduct.priceValue,
        quantity: 1,
        product: selectedProduct
      } as OrderItem)
    },
    onGoodsItemUpdate (item: ProductOrderItem) {
      const index = this.order?.orderItems.map(i => i.id).indexOf(this.order?.orderItems.map(i => i.id).filter(i => i === item.id)[0]!)!
      const oldItem = this.order?.orderItems[index]
      oldItem!.quantity = item.quantity
    },
    getGenderTranslated (gen: string) {
      switch (gen) {
        case 'male': return 'муж.'
        case 'female': return 'жен.'
        default: return '-'
      }
    },
    removeItem (item: OrderItem) {
      if (!confirm(`Вы уверены, что хотите удалить документ ${item.name} из заказа?`)) return
      this.order!.orderItems = this.order!.orderItems.filter(i => i !== item)
    },
    async markOrderAsReady () {
      this.changeOrderStatus('Пометить заказ как выполненный? Предварительно все внесённые изменения будут сохранены.', this.setOrderStatusReady, 'Заказ успешно помечен как выполненный')
    },
    async markOrderAsCancelled () {
      this.changeOrderStatus('Вы подтверждаете отмену заказа? Предварительно все внесённые изменения будут сохранены.', this.cancelOrder, 'Заказ успешно отменён')
    },
    async changeOrderStatus (message: string, method: (id: string) => Promise<RequestMachineResponse>, successNotificationText: string) {
      if (!confirm(message)) return
      await this.saveOrder()
      this.finishedLoading = false
      const response = await method(this.id!)
      if (!response.isSuccessful) {
        this.finishedLoading = true
        return
      }
      await this.loadOrder()
      this.finishedLoading = true
      this.pushNotification({
        title: successNotificationText
      })
    },
    async loadOrder () {
      const orderResponse = await this.loadOrderById(this.id)
      this.order = orderResponse.body
      if (this.hasPermission('authentication', 'retrieve_common_profile')) {
        const clientFull = await this.loadClientById(orderResponse.body.user)
        this.order!.user = clientFull
      }
    },
    ...mapMutations(['pushNotification', 'setLocalNotifications']),
    ...mapActions(['loadClientById', 'loadProducts']),
    ...mapActions('orders', ['loadOrderById', 'cancelOrder', 'updateOrder', 'setOrderStatusReady', 'setOrderStatusClosed'])
  },
  async created () {
    if (this.id) {
      await this.loadOrder()
      this.setLocalNotifications((this.localNotifications as LocalNotification[]).filter(n => n.meta !== this.id))
      this.finishedLoading = true
    } else this.$router.push(this.$routes.orders.list)
  }
})
</script>
