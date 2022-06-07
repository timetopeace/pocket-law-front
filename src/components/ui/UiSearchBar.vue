<template lang="pug">
.ui-search-bar
  form(@submit.prevent="confirmSearch")
    .ui-search-bar__fields
      slot
    button.ui-search-bar__confirm(type="submit")
      UiImage(
        @click.stop.prevent="confirmSearch"
        :src="require('@/assets/mangifying_glass.png')"
      )
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import UiImage from '@/components/ui/UiImage.vue'

export default defineComponent({
  name: 'UiSearchBar',
  emits: [
    'search'
  ],
  components: {
    UiImage
  },
  methods: {
    confirmSearch () {
      this.$emit('search')
    }
  }
})
</script>
