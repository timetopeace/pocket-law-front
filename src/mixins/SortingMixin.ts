import { defineComponent } from 'vue'
import { LabelValuePair } from '@/components/ui/UiDropdown.vue'

export interface SortRequestParams { [index: string]: string }

export default defineComponent({
  name: 'SortingMixin',
  watch: {
    searchParams: {
      deep: true,
      handler (val: any) {
        localStorage.setItem(`sorting:${this.$router.currentRoute.value.path}:sortBy`, val.sortBy)
        localStorage.setItem(`sorting:${this.$router.currentRoute.value.path}:sortType`, val.sortType)
      }
    }
  },
  data () {
    return {
      searchParams: {
        sortBy: null as null | string,
        sortType: 'asc' as 'asc' | 'desc'
      }
    }
  },
  computed: {
    getSearchParams () {
      const params = {} as SortRequestParams
      if (this.searchParams.sortBy) {
        params[this.searchParams.sortBy!] = this.searchParams.sortType
      }
      return params
    },
    getSortingOptions (): LabelValuePair<string>[] {
      return [
        {
          label: 'Дате публикации',
          value: 'publish_date'
        },
        {
          label: 'Дате редактирования',
          value: 'updated_at'
        }
      ]
    },
    getSortingTypeOptions (): LabelValuePair<string>[] {
      return [
        {
          label: 'По возрастанию',
          value: 'asc'
        },
        {
          label: 'По убыванию',
          value: 'desc'
        }
      ]
    }
  },
  created () {
    const sortBy = localStorage.getItem(`sorting:${this.$router.currentRoute.value.path}:sortBy`)
    const sortType = localStorage.getItem(`sorting:${this.$router.currentRoute.value.path}:sortType`)
    if (sortBy) this.searchParams.sortBy = sortBy
    if (sortType) this.searchParams.sortType = sortType as 'asc' | 'desc'
  }
})
