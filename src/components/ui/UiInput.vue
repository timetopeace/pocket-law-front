<template lang="pug">
input(
  ref="input"
  v-bind="$attrs"
  :value="modelValue"
  :checked="modelValue"
  @change="onChange"
  @input="onInput"
  @focus="onFocus"
  @blur="onBlur"
  @keydown.enter="onEnter").ui-input
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'UiInput',
  emits: [
    'enter',
    'change',
    'input',
    'debounce',
    'focus',
    'blur',
    'update:modelValue'
  ],
  props: {
    modelValue: {
      type: undefined
    },
    debounce: {
      type: Number,
      default: -1
    }
  },
  data () {
    return {
      debounceTimer: null as any
    }
  },
  computed: {
    getInputElement (): HTMLInputElement {
      return this.$refs.input as HTMLInputElement
    }
  },
  methods: {
    onEnter (): void {
      this.$emit('enter')
    },
    onChange (value: any): void {
      this.$emit('change', value)
      this.$emit('update:modelValue', value.target.value)
    },
    onInput (value: any): void {
      if (this.debounce !== -1) {
        if (this.debounceTimer) clearInterval(this.debounceTimer)
        this.debounceTimer = setTimeout(() => {
          this.onDebounce(value)
        }, this.debounce)
      }
      this.$emit('input', value)
      this.$emit('update:modelValue', value.target.value)
    },
    onDebounce (value: any) {
      this.$emit('debounce', value)
      this.$emit('update:modelValue', value.target.value)
    },
    onFocus (): void {
      this.$emit('focus')
    },
    onBlur (): void {
      this.$emit('blur')
    }
  }
})
</script>
