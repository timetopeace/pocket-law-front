<template lang="pug">
.deeplink-button
  .button.button--wide(
    @click="showModal"
    style="background: #248cc9;"
  ) Сгенерировать ссылку
  UiModal(
    :isShown="modalShown"
    @close="closeModal"
  )
    h2.mb-20 Сгенерировать ссылку
    .mb-20
      .mr-10
        .mb-5.ml-10 Тип ссылки
        UiDropdown(
          :options="deeplinkTypeOptions"
          :nullOption="{ label: 'Не выбран', value: null }"
          v-model="selectedDeeplinkType"
        )
    .mb-20
      .deeplink-button__param(
        v-for="param in selectedDeeplink.parameters"
      )
        SelectProducts(
          v-if="param.name === 'goodsId'"
          v-model="param.selectedValue"
          :isMultiChoice="false"
          :isDescription="true"
        )
    .mb-20.deeplink-button__linkBlock
      UiInput(
        :value="getFinalLink"
        disabled
      ).deeplink-button__finalLink
      UiInput(
        ref="finalDeeplink"
        :value="getFinalLink"
        type="hidden"
      )
      .deeplink-button__copy-button.button.button-blue(
        :class="{ 'button--disabled': !canCopyLink }"
        @click="copyDeeplink"
      ) Копировать
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState } from 'vuex'
import UiModal from '@/components/ui/UiModal.vue'
import UiDropdown from '@/components/ui/UiDropdown.vue'
import UiInput from '@/components/ui/UiInput.vue'
import SelectProducts from '@/components/modules/SelectProducts.vue'
import { ProductDescription } from '@/store/interfaces'
import { DeeplinkTypeInfo } from '@/interfaces'
import { deeplinkOptions } from '@/utils/constants'

export default defineComponent({
  name: 'DeeplinkButton',
  components: {
    UiModal,
    UiDropdown,
    UiInput,
    SelectProducts
  },
  data () {
    return {
      selectedDeeplinkType: null as DeeplinkTypeInfo | null,
      modalShown: false,
      products: [] as ProductDescription[],
      deeplinkTypeOptions: deeplinkOptions
    }
  },
  computed: {
    selectedDeeplink () : DeeplinkTypeInfo {
      for (let i = 0; i < this.deeplinkTypeOptions.length; i++) {
        if (this.deeplinkTypeOptions[i].value === this.selectedDeeplinkType) {
          return this.deeplinkTypeOptions[i].value
        }
      }
      return { name: '', parameters: [] }
    },
    getFinalLink (): string {
      if (!this.selectedDeeplinkType) return 'Ваша ссылка появится здесь'
      let linkCantBeCreated = false
      let finalLink = this.getBaseLinkByTypeName(this.selectedDeeplinkType!.name)
      this.selectedDeeplinkType!.parameters.forEach((param) => {
        if (!param.selectedValue) {
          finalLink = 'Выбраны не все параметры '
          linkCantBeCreated = true
        }
        if (linkCantBeCreated) return
        let value = param.selectedValue
        if (param.name === 'goodsId') {
          value = param.selectedValue.id
        }
        finalLink += `${param.paramName}=${value}&`
      })
      return finalLink.slice(0, -1)
    },
    canCopyLink (): boolean {
      return this.getFinalLink !== 'Ваша ссылка появится здесь' && this.getFinalLink !== 'Выбраны не все параметры'
    },
    ...mapState(['productDescriptionPagination'])
  },
  methods: {
    showModal () {
      this.modalShown = true
    },
    closeModal () {
      this.modalShown = false
    },
    copyDeeplink () {
      if (!this.canCopyLink) return
      const ref = (this.$refs.finalDeeplink as any).getInputElement
      ref.setAttribute('type', 'text')
      ref.select()
      ref.setSelectionRange(0, 99999)
      document.execCommand('copy')
      ref.setAttribute('type', 'hidden')
      this.closeModal()
      this.selectedDeeplinkType = null
    },
    getBaseLinkByTypeName (typeName: string): string {
      switch (typeName) {
        case 'profile': return 'pocketlaw://profile?'
        case 'goods': return 'pocketlaw://catalog?'
      }
      return ''
    }
  }
})
</script>
