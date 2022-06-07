<template lang="pug">
.clients-list
  HeadingWithControls(:heading="'Список клиентов'").mb-20
  UiSearchBar.mb-20(
    @search="onSearch"
  )
    .mr-10
      .mb-5.ml-10 Телефон
      UiInput(
        type="text"
        v-model="filters.phone"
        placeholder="Любой"
      )
  table.list-table.list-table--clickable
    thead
      tr
        th ID
        th ФИО
        th Телефон
        th Email
        th Дата рождения
        th Город
        th Пол
    tbody
      tr(v-for="client in clients")
        th
          RouterLink(:to="`${this.$routes.clients.list}/${client.id}`") {{ getTrimmedString(client.id, 8) }}
        th
          RouterLink(:to="`${this.$routes.clients.list}/${client.id}`") {{ getFullName(client.firstName, client.lastName, client.patronymicName) }}
        th
          RouterLink(:to="`${this.$routes.clients.list}/${client.id}`") {{ client.phone || '-' }}
        th
          RouterLink(:to="`${this.$routes.clients.list}/${client.id}`") {{ client.email || '-' }}
        th
          RouterLink(:to="`${this.$routes.clients.list}/${client.id}`") {{ getBirthDateFormatted(client.birthday) }}
        th
          RouterLink(:to="`${this.$routes.clients.list}/${client.id}`") {{ client.city ? client.city.name : '-' }}
        th
          RouterLink(:to="`${this.$routes.clients.list}/${client.id}`") {{ getGenderLetter(client.gender) }}
  UiPagination(
    ref="pagination"
    :uniqueName="'clients'"
    :allItemsCount="clientsCount"
    :loadedItemsCount="clients.length"
    :setItemsAction="setClients"
    :loadAction="loadClients"
    :setItemsCountAction="setClientsCount"
    :searchParams="filters"
    :loadByScrolling="false"
    :customItemsPerPage="10"
  ).clients-list__pagination
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapActions, mapMutations, mapState } from 'vuex'
import UiPagination from '@/components/ui/UiPagination.vue'
import UiSearchBar from '@/components/ui/UiSearchBar.vue'
import UiInput from '@/components/ui/UiInput.vue'
import HeadingWithControls from '@/components/modules/HeadingWithControls.vue'

export default defineComponent({
  name: 'ClientsList',
  components: {
    HeadingWithControls,
    UiPagination,
    UiSearchBar,
    UiInput
  },
  data () {
    return {
      filters: {
        phone: ''
      }
    }
  },
  computed: {
    ...mapState(['clients', 'clientsCount'])
  },
  methods: {
    getFullName (firstName: string, lastName: string, patronymic: string) {
      return [lastName, firstName, patronymic].join(' ').trim() || '-'
    },
    onSearch () {
      const pagination = (this.$refs.pagination as any)
      pagination.resetPagination()
    },
    getBirthDateFormatted (birthDate: string) {
      if (!birthDate) return '-'
      const dateSplit = birthDate.split('-')
      return [dateSplit[2], dateSplit[1], dateSplit[0]].join('.')
    },
    ...mapMutations(['setClients', 'setClientsCount']),
    ...mapActions(['loadClients'])
  }
})
</script>
