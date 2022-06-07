<template lang="pug">
.media-preview
  .media-preview__button.button.button-blue(@click="showModal")
    | Проверить {{ type === 'image' ? 'картинку' : 'файл' }}
  UiModal(
    :isShown="isModalShown"
    @close="isModalShown = false"
  )
    .media-preview__content
      .mb-10 Устройство
      UiDropdown(
        :options="getDeviceOptions"
        :canSelectNull="false"
        :nullOption="{ label: 'Не из списка' }"
        v-model="selectedDevice"
        @select="resChanged"
      ).mb-10
      .media-preview__cover
        textarea(
          v-if="type === 'image'"
          ref="preview"
          disabled
          :style="{ backgroundImage: `url(${src}) !important` }"
        ).media-preview__image
        file.story-edit__file(
          ref="preview"
          v-else
          controls
          :key="src"
        ).media-preview__file
          source(:src="src" type='file/mp4; codecs="avc1.42E01E, mp4a.40.2"')
      .button.button-gray(@click="isModalShown = false") Закрыть
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import UiDropdown, { LabelValuePair } from '@/components/ui/UiDropdown.vue'
import UiModal from '@/components/ui/UiModal.vue'

interface DeviceResolution {
  w: number, h: number
}

export default defineComponent({
  name: 'MediaPreview',
  components: {
    UiDropdown,
    UiModal
  },
  props: {
    src: {
      type: String,
      required: true
    },
    type: {
      type: String as () => 'image' | 'file',
      default: 'image'
    }
  },
  data () {
    return {
      selectedDevice: null as DeviceResolution | null,
      isModalShown: false,
      multiplier: 0.5
    }
  },
  mounted () {
    this.selectedDevice = this.getDeviceOptions[0].value
    this.resChanged()
  },
  methods: {
    resChanged () {
      this.$nextTick(() => {
        const preview = this.$refs.preview as HTMLElement
        preview.style.width = (this.selectedDevice!.w * this.multiplier).toString() + 'px'
        preview.style.height = (this.selectedDevice!.h * this.multiplier).toString() + 'px'
      })
    },
    showModal () {
      this.isModalShown = true
      this.resChanged()
    }
  },
  computed: {
    getDeviceOptions (): LabelValuePair<DeviceResolution>[] {
      return [
        {
          label: 'Pixel 2 XL (411 × 832)',
          value: { w: 411, h: 832 }
        },
        {
          label: 'iPhone 6/7/8 Plus (414 × 736)',
          value: { w: 414, h: 736 }
        },
        {
          label: 'iPhone X (375 × 812)',
          value: { w: 375, h: 812 }
        },
        {
          label: 'iPad (768 × 1024)',
          value: { w: 768, h: 1024 }
        },
        {
          label: 'Galaxy Fold (280 × 635)',
          value: { w: 280, h: 635 }
        }
      ]
    },
    getMultiplierOptions () {
      return [
        {
          label: '25%',
          value: 0.25
        },
        {
          label: '50%',
          value: 0.5
        },
        {
          label: '75%',
          value: 0.75
        }
      ]
    }
  }
})
</script>
