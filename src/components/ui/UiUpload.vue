<template lang="pug">
.ui-upload
  label.ui-upload__label.button(
    :class="{ 'button--disabled': disabled }"
  ) {{ inputMessage }}
    input(
      ref="fileInput"
      v-bind="$attrs"
      @change.prevent="onUpload"
      :disabled="disabled"
      type="file"
    ).ui-upload__input
  a.ui-upload__message(
    :href="uploadedDataURL ? (uploadedDataURL.startsWith('data:') ? undefined : uploadedDataURL) : undefined"
    target="_blank"
    @mouseover="hover = true"
    @mouseleave="hover = false"
  ) {{ isLinkReplacedWithShortText && uploadedDataURL ? 'Ссылка' : fileName }}
  img(
    v-show="!noPreview"
    @error="noPreview = true"
    ref="image"
    :class="{ 'ui-image__preview-shown': hover }"
    :style="{ 'top': mouseY + 'px', 'left': mouseX + 'px' }"
    :src="uploadedDataURL"
  ).ui-upload__preview
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import UiImage from '@/components/ui/UiImage.vue'

export default defineComponent({
  name: 'UiUpload',
  emits: [
    'upload',
    'update:uploadedData',
    'update:uploadedDataURL'
  ],
  components: {
    UiImage
  },
  props: {
    inputMessage: {
      type: String,
      default: () => 'Выбрать файл'
    },
    uploadedData: {
      type: Object as () => File,
      default: () => null
    },
    uploadedDataURL: {
      type: String,
      default: () => ''
    },
    disabled: {
      type: Boolean,
      default: () => false
    },
    maxFileSizeInMegaBytes: {
      type: Number,
      default: () => 20
    },
    isLinkReplacedWithShortText: {
      type: Boolean,
      default: () => false
    }
  },
  data () {
    return {
      hover: false,
      mouseX: -99990,
      mouseY: -99990,
      noPreview: false
    }
  },
  watch: {
    uploadedDataURL () {
      this.noPreview = false
      this.alignImage()
    }
  },
  computed: {
    refFileInput (): HTMLInputElement {
      return this.$refs.fileInput as HTMLInputElement
    },
    fileName (): string {
      if (this.uploadedData) {
        return this.uploadedData.name
      }
      if (this.uploadedDataURL) {
        if (this.uploadedDataURL.length > 70) {
          return this.uploadedDataURL.substring(0, 70) + '...'
        }
        return this.uploadedDataURL
      }
      return ''
    }
  },
  methods: {
    onUpload (e: any) {
      const file = e.target.files[0]
      if (file.size > this.maxFileSizeInMegaBytes * 1024 * 1024) { // Макс. размер файла
        alert(`Размер файла не должен превышать ${this.maxFileSizeInMegaBytes}МБ`)
        return
      }
      e.target.value = ''
      if (!file) return
      this.updateDataURL(file)
      this.$emit('upload', file)
    },
    updateDataURL (file: File) {
      this.$emit('update:uploadedData', file)
      const fileReader = new FileReader()
      fileReader.onload = (e: any) => {
        this.$emit('update:uploadedDataURL', e.target.result)
      }
      fileReader.readAsDataURL(file as File)
    },
    alignImage () {
      const image = this.$refs.image as HTMLImageElement
      document.addEventListener('mousemove', (e) => {
        if (!this.hover) return
        this.mouseX = e.clientX - image.offsetWidth / 2
        this.mouseY = e.clientY - image.offsetHeight - 20
      })
    }
  },
  mounted () {
    this.alignImage()
  }
})
</script>
