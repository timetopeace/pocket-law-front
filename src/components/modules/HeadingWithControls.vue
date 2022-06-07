<template lang="pug">
.heading
  h2(:style="{ 'fontSize': customFontSize + 'px' }") {{ heading }}
  .heading__control(
    v-for="control in controls"
    @click="control.action"
    :class="getControlClassByType"
  ) {{ getControlLabelByType(control.type) }}
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export type HeadingControlType = 'plus' | 'minus'

export interface HeadingControl {
  type: HeadingControlType,
  action: Function
}

export default defineComponent({
  name: 'HeadingWithControls',
  props: {
    heading: {
      type: String,
      required: true
    },
    controls: {
      type: Array as () => HeadingControl[],
      default: () => []
    },
    customFontSize: {
      type: Number,
      default: () => 32
    }
  },
  methods: {
    getControlLabelByType (type: HeadingControlType) {
      switch (type) {
        case 'plus': return '+'
        case 'minus': return '-'
      }
    },
    getControlClassByType (type: HeadingControlType) {
      return 'heading__control--' + type
    }
  }
})
</script>
