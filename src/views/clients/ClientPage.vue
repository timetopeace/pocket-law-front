<template lang="pug">
.client-page
  .client-page__content(v-if="finishedLoading")
    HeadingWithControls(:heading="getFullName").mb-20
    .d-flex.d-justify-center
      BanMenu(:userProfile="userProfile" @banUser="onBanUser" @unbanUser="onUnbanUser" @changeUserBan="onChangeUserBan").mr-20
      .d-flex-column.d-justify-center
        table.list-table.mb-20
          thead
            tr
              th Поле
              th Значение
          tbody
            tr
              th ID
              th {{ id }}
            tr
              th Фамилия
              th {{ userProfile.lastName  || '-' }}
            tr
              th Имя
              th {{ userProfile.firstName || '-' }}
            tr
              th Отчество
              th {{ userProfile.patronymicName || '-' }}
            tr
              th Статус
              th(:style="{ 'color': getStatusForAny('clients', userProfile.status).color }") {{ getStatusForAny('clients', userProfile.status).name }}
            tr
              th Пол
              th {{ getGenderLetter(userProfile.gender) }}
            tr
              th Номер телефона
              th {{ userProfile.phone }}
            tr
              th Город
              th {{ userProfile.city ? userProfile.city.name : '-' }}
            tr
              th Дата рождения
              th {{ userProfile.birthday || '-' }}
            tr
              th Почта
              th {{ userProfile.email || '-' }}
            tr
              th Дата регистрации
              th {{ getCreationDate }}
        BarcodeViewer(v-if="loyaltyProfile" :barcode="loyaltyProfile.barcode")
  .loading(v-else)
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapActions, mapMutations } from 'vuex'
import UiInput from '@/components/ui/UiInput.vue'
import HeadingWithControls from '@/components/modules/HeadingWithControls.vue'
import BarcodeViewer from '@/components/modules/BarcodeViewer.vue'
import BanMenu from '@/components/modules/BanMenu.vue'
import { UserProfile, LoyaltyProfile, Ban } from '@/store/interfaces'

export default defineComponent({
  components: {
    UiInput,
    HeadingWithControls,
    BarcodeViewer,
    BanMenu
  },
  props: {
    id: {
      type: String
    }
  },
  data () {
    return {
      userProfile: {} as UserProfile,
      loyaltyProfile: {} as LoyaltyProfile
    }
  },
  computed: {
    getCreationDate (): string {
      return this.userProfile.createdAt
        ? new Date(this.userProfile.createdAt).toLocaleDateString('ru')
        : ''
    },
    getFullName (): string {
      return [this.userProfile.lastName, this.userProfile.firstName, this.userProfile.patronymicName].join(' ').trim() || 'Клиент'
    }
  },
  methods: {
    async loadClient () {
      const client = await this.loadClientById(this.id)
      this.userProfile = client.userProfile
      this.loyaltyProfile = client.loyaltyProfile
    },
    async onBanUser (ban: Ban) {
      this.finishedLoading = false
      const response = await this.banUser(ban)
      await this.loadClient()
      if (response.isSuccessful) {
        this.pushNotification({
          title: 'Пользователь был успешно заблокирован'
        })
      }
      this.finishedLoading = true
    },
    async onUnbanUser () {
      this.finishedLoading = false
      const response = await this.unbanUser(this.userProfile.ban!.id)
      await this.loadClient()
      if (response.isSuccessful) {
        this.pushNotification({
          title: 'Пользователь был успешно разблокирован'
        })
      }
      this.finishedLoading = true
    },
    async onChangeUserBan (ban: Ban) {
      this.finishedLoading = false
      const response = await this.changeUserBan({ banId: this.userProfile.ban!.id, ban: ban })
      await this.loadClient()
      if (response.isSuccessful) {
        this.pushNotification({
          title: 'Информация о блокировке пользователя была успешно изменена'
        })
      }
      this.finishedLoading = true
    },
    ...mapActions(['loadClientById', 'banUser', 'unbanUser', 'changeUserBan']),
    ...mapMutations(['pushNotification'])
  },
  async mounted () {
    await this.loadClient()
    this.finishedLoading = true
  }
})
</script>
