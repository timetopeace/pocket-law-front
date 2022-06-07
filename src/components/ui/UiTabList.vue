<template lang="pug">
.ui-tab-list
  .mb-40
    .ui-tab-list__tab-wrapper(
      v-if="itemsCollection.length > 0"
      ref="tabWrapper"
      :key="timesUpdated"
    )
      .ui-tab-list__item(
        v-for="(item, i) in itemsCollection"
        :key="item.id"
      )
        .ui-tab-list__gap
        .ui-tab-list__tab(
          @click="selectTab(i)"
          :draggable="canChangeOrder && !disabled"
          :class="{ 'ui-tab-list__tab-active': itemNumber === i }"
        ) {{ i + 1 }}
      .ui-tab-list__item
        .ui-tab-list__gap
      .ui-tab-list__item
        .ui-tab-list__tab.ui-tab-list__plus(
          @click="newTab"
          v-if="!disabled"
        ) +
    div(v-if="canChangeOrder && itemsCollection.length > 1 && !disabled")
      .ui-tab-list__warning(
        v-if="timesUpdated > 0"
      ) Нумерация показывает оригинальный порядок элементов
      .ui-tab-list__tip(v-else) Измените порядок элементов, перетягивая значки выше
  slot(v-if="itemsCollection.length")
  .ui-tab-list__remove-button.button(
    v-if="itemsCollection.length > 0"
    :class="{ 'button--disabled': itemsCollection.length <= minItems || disabled || !canDelete }"
    @click="removeSelected"
  ) {{ deleteSelectedButtonText }}
  .button.button--regularly-wide(
    v-if="!itemsCollection.length"
    @click="newTab"
  ) {{ addItemButtonText }}
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'UiTabList',
  emits: [
    'update:itemNumber',
    'update:itemsCollection',
    'newTab',
    'select',
    'removeSelected'
  ],
  props: {
    itemNumber: {
      type: Number,
      required: true
    },
    itemsCollection: {
      type: Array,
      required: true
    },
    deleteSelectedButtonText: {
      type: String,
      default: () => 'Удалить'
    },
    addItemButtonText: {
      type: String,
      default: () => 'Добавить'
    },
    minItems: {
      type: Number,
      default: () => 1
    },
    deleteMessage: {
      type: String,
      default: () => 'Вы подтверждаете удаление выбранного элемента?'
    },
    defaultNewItem: {
      type: Object,
      default: () => {}
    },
    canChangeOrder: {
      type: Boolean,
      default: () => false
    },
    disabled: {
      type: Boolean,
      default: () => false
    },
    canDelete: {
      type: Boolean,
      default: () => true
    }
  },
  data () {
    return {
      timesUpdated: 0
    }
  },
  mounted () {
    this.initDragging()
  },
  methods: {
    initDragging () {
      if (!this.canChangeOrder || this.disabled) return
      setTimeout(() => {
        const wrapper = this.$refs.tabWrapper as HTMLElement
        wrapper.querySelectorAll('.ui-tab-list__item').forEach((item, i) => {
          const tab = item.querySelector('.ui-tab-list__tab')
          const gap = item.querySelector('.ui-tab-list__gap')
          if (tab) {
            if (tab.classList.contains('ui-tab-list__plus')) return
            tab.addEventListener('dragstart', (e: any) => {
              e.dataTransfer.setData('text', i)
            })
          }
          if (gap) {
            gap.addEventListener('dragover', (e) => {
              gap.classList.add('ui-tab-list__gap-active')
              e.preventDefault()
            })
            gap.addEventListener('dragleave', () => {
              gap.classList.remove('ui-tab-list__gap-active')
            })
            gap.addEventListener('drop', (e: any) => {
              e.preventDefault()
              e.stopPropagation()
              // Это очень важная строчка.
              // Без неё событие вызывается много раз и всё ломается :c
              e.stopImmediatePropagation()
              gap.classList.remove('ui-tab-list__gap-active')
              const oldIndex = e.dataTransfer.getData('text')
              const newCollection = [...this.itemsCollection]
              let newIndex = i
              if (newIndex > oldIndex) newIndex--
              const oldElement = newCollection[oldIndex]
              newCollection.splice(oldIndex, 1)
              newCollection.splice(newIndex, 0, oldElement)
              this.$emit('update:itemsCollection', newCollection)
              this.timesUpdated++
            })
          }
        })
      }, 100)
    },
    selectTab (itemNumber: number) {
      this.$emit('update:itemNumber', itemNumber)
      this.$emit('select', itemNumber)
    },
    newTab () {
      const newCollection = [...this.itemsCollection]
      newCollection.push({ ...this.defaultNewItem })
      this.$emit('update:itemsCollection', newCollection)
      this.$emit('update:itemNumber', newCollection.length - 1)
    },
    removeSelected () {
      if (this.itemsCollection.length <= this.minItems || this.disabled || !this.canDelete) return
      if (!confirm(this.deleteMessage)) return
      const newCollection = [...this.itemsCollection]
      newCollection.splice(this.itemNumber, 1)
      if (this.itemNumber >= newCollection.length) this.$emit('update:itemNumber', newCollection.length - 1)
      this.$emit('update:itemsCollection', newCollection)
    }
  }
})
</script>
