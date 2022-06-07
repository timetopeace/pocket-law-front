<template lang="pug">
.ui-pagination(v-if="allItemsCount")
  div(v-if="finishedLoading")
    .d-flex(v-if="!loadByScrolling")
      .ui-pagination__label Отображать на странице:
      UiInput(
        :value="itemsPerPage"
        @change="changeItemsPerPage"
        type="number"
      ).ui-pagination__items-per-page
      .ui-pagination__label {{ getPaginationInformation }}
      .d-flex(v-if="allItemsCount > itemsPerPage")
        .ui-pagination__control.ui-pagination__control-normal.mr-10(
          @click="goToPage(0)"
        ) 1
        .ui-pagination__control.ui-pagination__control-previous(@click="previousPage") «
        .ui-pagination__control(
          v-for="page in getPages"
          :class="{ 'ui-pagination__control--currentPage': page == currentPage }"
          @click="goToPage(page)"
        ) {{ page + 1 }}
        .ui-pagination__control.ui-pagination__control-next(@click="nextPage") »
        .ui-pagination__control.ui-pagination__control-normal.ml-10(
          @click="goToPage(getPagesCount - 1)"
        ) {{ getPagesCount }}
    .d-flex(v-else-if="loadedItemsCount < allItemsCount")
      .button(@click="loadDataUntilFilled") Загрузить ещё
  .loading(v-else)
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState } from 'vuex'
import UiInput from '@/components/ui/UiInput.vue'

export default defineComponent({
  name: 'UiPagination',
  components: {
    UiInput
  },
  props: {
    uniqueName: {
      type: String,
      required: true
    },
    customItemsPerPage: {
      type: Number,
      default: () => 5
    },
    cleanItemsImmediately: {
      type: Boolean,
      default: () => false
    },
    loadedItemsCount: {
      type: Number,
      required: true
    },
    allItemsCount: {
      type: Number,
      required: true
    },
    loadByScrolling: {
      type: Boolean,
      default: () => false
    },
    loadAction: {
      type: Function,
      required: true
    },
    searchParams: {
      type: Object,
      default: () => {}
    },
    setItemsAction: {
      type: Function,
      required: true
    },
    setItemsCountAction: {
      type: Function,
      required: true
    }
  },
  watch: {
    currentPage (val: number) {
      if (this.loadByScrolling) return
      sessionStorage.setItem(`ui_pagination:currentPage:${this.uniqueName}:${this.staffProfile.phone}`, val.toString())
    }
  },
  data () {
    return {
      currentPage: 0,
      itemsPerPage: 5,
      preventLoading: false,
      resizeTimer: null as any
    }
  },
  computed: {
    getPagesCount (): number {
      return Math.ceil(this.allItemsCount / this.itemsPerPage)
    },
    getCurrentPageFirstItemNumber (): number {
      return this.currentPage * this.itemsPerPage
    },
    getCurrentPageLastItemNumber (): number {
      const value = this.getCurrentPageFirstItemNumber + this.itemsPerPage
      return value <= this.allItemsCount ? value : this.allItemsCount
    },
    getPaginationInformation (): string {
      return this.getCurrentPageFirstItemNumber + 1 === this.getCurrentPageLastItemNumber
        ? `${this.getCurrentPageLastItemNumber} из ${this.allItemsCount}`
        : `${this.getCurrentPageFirstItemNumber + 1}-${this.getCurrentPageLastItemNumber} из ${this.allItemsCount}`
    },
    getPages (): number[] {
      const pages = []
      let pageToTest
      for (let i = -3; i <= 3; i++) {
        pageToTest = this.currentPage + i
        if (pageToTest >= 0 && pageToTest < this.getPagesCount) {
          pages.push(pageToTest)
        }
      }
      return pages
    },
    canGoToPrevious (): boolean {
      return this.currentPage > 0
    },
    canGoToNext (): boolean {
      return this.currentPage < this.allItemsCount / this.itemsPerPage - 1
    },
    ...mapState(['staffProfile'])
  },
  methods: {
    canScrollBody (): boolean {
      return document.body.scrollHeight - 200 > document.body.clientHeight
    },
    previousPage () {
      if (!this.canGoToPrevious) return
      this.currentPage = this.currentPage - 1
      this.loadNewData()
    },
    nextPage () {
      if (!this.canGoToNext) return
      this.currentPage = this.currentPage + 1
      this.loadNewData()
    },
    goToPage (page: number) {
      this.currentPage = page
      this.loadNewData()
    },
    changeItemsPerPage (value: any) {
      const number = Number(value.target.value)
      if (number <= 0 || number % 1 !== 0) return
      this.currentPage = 0
      this.itemsPerPage = number < this.allItemsCount ? number : this.allItemsCount
      localStorage.setItem(`ui_pagination:itemsPerPage:${this.uniqueName}:${this.staffProfile.phone}`, this.itemsPerPage.toString())
      this.loadNewData()
    },
    async loadNewData () {
      this.finishedLoading = false
      if (this.cleanItemsImmediately) {
        this.setItemsAction([])
      }
      await this.loadAction({ limit: this.itemsPerPage, offset: this.currentPage * this.itemsPerPage, ...this.searchParams })
      this.finishedLoading = true
    },
    // Загрузка данных до появления скролла.
    async loadDataUntilFilled () {
      if (this.loadedItemsCount >= this.allItemsCount && this.allItemsCount !== -1) return
      this.finishedLoading = false
      const additionalEntries = this.loadedItemsCount % this.itemsPerPage
        ? (this.loadedItemsCount % this.itemsPerPage)
        : 0
      do {
        await this.loadAction({ limit: this.itemsPerPage + additionalEntries, offset: this.loadedItemsCount, ...this.searchParams })
        this.currentPage++
      } while (this.loadByScrolling && !this.canScrollBody() && this.loadedItemsCount < this.allItemsCount && !this.preventLoading)
      this.finishedLoading = true
    },
    // Подгрузка данных, которая происходит только
    // если пользователь долистал до низа страницы.
    async loadIfScrolled () {
      const minOffsetBeforeScrollEnd = 120
      if (window.scrollY + document.body.clientHeight > document.body.scrollHeight - minOffsetBeforeScrollEnd && this.finishedLoading) {
        await this.loadDataUntilFilled()
      }
    },
    async automaticallyChangeItemsPerPage () {
      const cardWidth = 275
      const gap = 25
      const sideBarWidthWithTemplatePadding = 300 + 60

      this.itemsPerPage = Math.floor((window.innerWidth - sideBarWidthWithTemplatePadding) / (cardWidth + gap) + 0.08)
    },
    onResizeEnd () {
      this.automaticallyChangeItemsPerPage()
      this.loadIfScrolled()
    },
    onResize () {
      clearTimeout(this.resizeTimer)
      this.resizeTimer = setTimeout(this.onResizeEnd, 100)
    },
    resetItemsPerPage () {
      let savedItemsPerPage = localStorage.getItem(`ui_pagination:itemsPerPage:${this.uniqueName}:${this.staffProfile.phone}`)
      if (this.loadByScrolling) savedItemsPerPage = null
      if (this.itemsPerPage > 500) this.itemsPerPage = 500
      this.itemsPerPage = Number(savedItemsPerPage ?? this.customItemsPerPage)
    },
    resetPagination () {
      this.resetItemsPerPage()
      this.setItemsAction([])
      this.setItemsCountAction(-1)
      // Это нужно для того, чтобы все props успевали обновиться до того,
      // как будет отправлен запрос на получение новых данных.
      this.$nextTick(() => {
        this.loadByScrolling ? this.loadDataUntilFilled() : this.loadNewData()
      })
    }
  },
  async mounted () {
    this.resetItemsPerPage()
    this.setItemsAction([])
    if (this.loadByScrolling) {
      this.automaticallyChangeItemsPerPage()
      document.addEventListener('scroll', this.loadIfScrolled)
      window.addEventListener('resize', this.onResize)
    } else {
      const savedPage = sessionStorage.getItem(`ui_pagination:currentPage:${this.uniqueName}:${this.staffProfile.phone}`)
      this.currentPage = savedPage ? Number(savedPage) : 0
    }
    this.loadByScrolling ? await this.loadDataUntilFilled() : await this.loadNewData()

    this.finishedLoading = true
    if (this.itemsPerPage > this.allItemsCount && this.allItemsCount !== -1) {
      this.itemsPerPage = this.allItemsCount
    }
  },
  beforeUnmount () {
    document.removeEventListener('scroll', this.loadIfScrolled)
    window.removeEventListener('resize', this.onResize)
    this.setItemsAction([])
    this.setItemsCountAction(-1)
    this.currentPage = 0
    this.preventLoading = true
  }
})
</script>
