<template lang="pug">
.orders
  RouterView
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { initStoreModule } from '@/utils/helpers/storeHelpers'
import { store } from './store'

export default defineComponent({
  name: 'Orders',
  beforeMount () {
    initStoreModule('orders', store)
  }
})
</script>
