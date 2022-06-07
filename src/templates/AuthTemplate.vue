<template lang="pug">
.auth-template
  UiNotifications
  slot
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import UiNotifications from '@/components/ui/UiNotifications.vue'

export default defineComponent({
  name: 'AppTemplate',
  components: {
    UiNotifications
  }
})
</script>
