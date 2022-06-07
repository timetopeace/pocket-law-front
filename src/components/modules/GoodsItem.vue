<template lang="pug">
.goods-item
  .goods-item__grid
    UiImage.goods-item__image(
      :src="goodsItem.product.previewImage || ''"
    )
    .goods-item__texts
      .mb-20.mr-20
        h4.mb-5 {{ goodsItem.product.name }}
        h4 {{ goodsItem.product.code }}
      .goods-item__bottom
        .goods-item__price
          span(v-if="goodsItem.product.price") {{ goodsItem.product.priceValue.toLocaleString('ru-RU', {style: 'currency', currency: 'RUB' }) }}
        .goods-item__count-control-wrapper
          .goods-item__count-control.clickable(@click="changeQuantity(false)") -
          .goods-item__count-control.goods-item__count-control--amount {{ `${goodsItem.quantity * goodsItem.product.volume} ${goodsItem.product.unit}` }}
          .goods-item__count-control.clickable(@click="changeQuantity(true)") +
  .goods-item__quantity(v-for="container in goodsItem.containers")
    | {{ container.quantity }} тары по {{ container.volume }}{{ goodsItem.product.unit }}
  .goods-item__cross(v-if="canDelete" @click="$emit('delete')") ×
</template>

<script lang="ts">
import { ProductOrderItem } from '@/store/interfaces'
import { defineComponent } from 'vue'
import { mapGetters } from 'vuex'
import UiImage from '@/components/ui/UiImage.vue'

export default defineComponent({
  name: 'GoodsItem',
  emits: [
    'update'
  ],
  components: {
    UiImage
  },
  props: {
    goodsItem: {
      type: Object as () => ProductOrderItem,
      required: true
    },
    canDelete: {
      type: Boolean,
      default: () => true
    },
    canChangeCount: {
      type: Boolean,
      default: () => true
    }
  },
  computed: mapGetters(['hasPermission']),
  methods: {
    changeQuantity (increase: boolean) {
      if (!this.canChangeCount) return
      let incrementAmount = 1
      if (!increase) incrementAmount *= -1
      const newGoodsItem = { ...this.goodsItem }
      if (newGoodsItem.quantity + incrementAmount <= 0) return
      newGoodsItem.quantity += incrementAmount
      this.$emit('update', newGoodsItem)
    }
  },
  async mounted () {
    this.finishedLoading = true
  }
})
</script>
