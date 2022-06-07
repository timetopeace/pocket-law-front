<template lang="pug">
.ui-dropdown(
  ref="dropdown" tabindex="-1"
  :class="{ 'ui-dropdown--disabled': disabled }"
)
  UiInput(
    v-model="inputValue"
    type="text"
    :class="{ 'ui-dropdown--searchable': searchable }"
    :disabled="disabled"
    @focus="onFocus"
    @blur="onBlur"
  ).ui-dropdown__input
  .ui-dropdown__options(ref="options")
    .ui-dropdown__option(
      v-for="(option, i) in getOptions"
      :key="i"
      @blur.stop.prevent
      @click.stop.prevent="selectValue(option)"
      :tabindex="i"
    )
      p {{ option.label }}
      UiInput(
        v-if="isMultiChoice"
        type="checkbox"
        disabled
        @click.prevent
        :checked="isOptionSelected(option)"
      ).ml-50
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import UiInput from '@/components/ui/UiInput.vue'

export interface LabelValuePair<T> {
  label: string,
  value: T
}

export default defineComponent({
  name: 'UiDropdown',
  emits: [
    'select',
    'update:modelValue'
  ],
  components: {
    UiInput
  },
  props: {
    modelValue: {
      type: undefined,
      required: true
    },
    options: {
      type: Array as () => LabelValuePair<any>[],
      required: true
    },
    nullOption: {
      type: Object as () => LabelValuePair<any>,
      default: () => { return { label: 'Выберите опцию', value: null } }
    },
    searchable: {
      type: Boolean,
      default: () => false
    },
    canSelectNull: {
      type: Boolean,
      default: () => false
    },
    isMultiChoice: {
      type: Boolean,
      default: () => false
    },
    disabled: {
      type: Boolean,
      default: () => false
    }
  },
  watch: {
    modelValue () {
      this.setInputLabel()
    }
  },
  data () {
    return {
      inputValue: 'Выберите опцию'
    }
  },
  computed: {
    refDropdown (): HTMLInputElement {
      return this.$refs.dropdown as HTMLInputElement
    },
    getOptions (): LabelValuePair<any>[] {
      const options = this.options.filter(o => !this.searchable || o.label.toLowerCase().includes(this.inputValue.toLowerCase()))
      return (this.modelValue && !this.canSelectNull) || this.isMultiChoice ? options : [this.nullOption, ...options]
    }
  },
  methods: {
    isOptionSelected (option: LabelValuePair<any>) {
      return this.isMultiChoice
        ? (this.modelValue as any[]).includes(option.value)
        : this.modelValue === option.value
    },
    selectValue (option: LabelValuePair<any>) {
      if (this.disabled) return
      if (this.isMultiChoice) {
        if (this.isOptionSelected(option)) {
          this.$emit('update:modelValue', (this.modelValue as any[]).filter(v => JSON.stringify(v) !== JSON.stringify(option.value)))
        } else {
          this.$emit('update:modelValue', [...(this.modelValue as any[]), option.value])
        }
      } else {
        this.refDropdown.focus()
        this.refDropdown.blur()
        this.$emit('update:modelValue', option.value)
      }
      this.$emit('select', option)
      this.inputValue = option.label
    },
    setInputLabel () {
      const selectedValue = this.options.filter(o => {
        if (typeof (o.value) === 'object' && this.modelValue) {
          return JSON.stringify(o.value) === JSON.stringify(this.modelValue)
        } else {
          return o.value === this.modelValue
        }
      })[0]
      if (this.isMultiChoice) {
        this.inputValue = this.options.filter(o => this.isOptionSelected(o)).map(o => o.label).join(', ') || this.nullOption.label
      } else {
        this.inputValue = selectedValue ? selectedValue.label : this.nullOption.label
      }
    },
    onFocus () {
      if (this.searchable && !this.disabled) this.inputValue = ''
    },
    onBlur () {
      setTimeout(() => {
        const selected = this.options.filter(o => this.isOptionSelected(o))[0]
        if (this.searchable) this.inputValue = selected ? selected.label : this.nullOption.label
      }, 10)
    }
  },
  mounted () {
    // Предотвратить событие blur при клике по полосе прокрутки.
    (this.$refs.options as HTMLElement).onmousedown = () => false
    this.setInputLabel()
  }
})
</script>
