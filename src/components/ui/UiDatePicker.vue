<template lang="pug">
UiInput(
  v-bind="$attrs"
  type="date"
  @blur="onBlur"
  :modelValue="getValueFormatted"
  ref="dateinput"
)
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { getDateFormatted } from '@/utils/helpers/helpFunctions'
import UiInput from '@/components/ui/UiInput.vue'

export default defineComponent({
  name: 'UiDatePicker',
  components: {
    UiInput
  },
  emits: [
    'update:modelValue'
  ],
  props: {
    modelValue: {
      type: undefined
    }
  },
  computed: {
    getValueFormatted (): string {
      return this.modelValue ? getDateFormatted((this.modelValue as Date).toString(), '.', '-') : ''
    }
  },
  methods: {
    onBlur () {
      const date = new Date((this.$refs.dateinput as any).$el.value)
      this.$emit('update:modelValue', date)
    }
  }
})
</script>
