<template lang="pug">
.ui-modal(
  :class="{ 'ui-modal--shown': isShown }"
  @click.self="closeModal"
)
  .ui-modal__content
    slot
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'UiModal',
  emits: ['close'],
  props: {
    isShown: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    closeModal () {
      this.$emit('close')
    }
  }
})
</script>
