<template lang="pug">
div
  .auth
    form(@submit.prevent="onSubmit").auth-form
      UiInput(placeholder="Номер телефона" type="text" v-model="phoneNumber" maxlength="11" minlength="10" required).auth-form__input
      UiInput(placeholder="Пароль" type="password" v-model="password" :isPassword="true" minlength="6" required).auth-form__input
      UiInput(v-if="finishedLoading" type="submit" value="Продолжить").auth-form__input.button--wide
      .loading(v-else)
    .mt-50(v-if="isDevelopment")
      .mb-10 Для тестов
      .button(@click="phoneNumber = '89990000000'; password='dev_password'; onSubmit()").mb-10 Я - администратор
      .button(@click="phoneNumber = '89000000335'; password='dev_password'; onSubmit()").mb-10 Я - оператор колл-центра
      .button(@click="phoneNumber = '89000000338'; password='dev_password'; onSubmit()").mb-10 Я - кассир/менеджер
      .button(@click="phoneNumber = '89000000337'; password='dev_password'; onSubmit()") Я - маркетолог/модератор
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import UiInput from '@/components/ui/UiInput.vue'
import { mapActions, mapMutations, mapState } from 'vuex'

export default defineComponent({
  name: 'Auth',
  components: {
    UiInput
  },
  data () {
    return {
      phoneNumber: '',
      password: ''
    }
  },
  watch: {
    accessToken (value: string) {
      if (value) this.$router.push('/')
    }
  },
  computed: {
    isDevelopment () {
      return !process.env.VUE_APP_ENV || process.env.VUE_APP_ENV === 'development'
    },
    ...mapState(['accessToken'])
  },
  methods: {
    async onSubmit () {
      let error = ''
      this.finishedLoading = false
      const response = await this.login({ phone: this.phoneNumber, password: this.password })
      this.finishedLoading = true
      if (response.code === 400) {
        const phone = response.body.phone || []
        const password = response.body.password || []
        error = [...phone, ...password][0]
      } else if (response.code === 401) {
        error = 'Неверный логин или пароль'
      } else if (!response.isSuccessful) {
        error = 'Сервер вернул ошибку с кодом ' + response.code
      }
      if (error) {
        this.pushNotification({
          title: 'Ошибка при попытке авторизации',
          description: error
        })
        return
      }
      this.setAccessToken(response.body.access)
      this.setRefreshToken(response.body.refresh)
      this.$emit('loginSuccessful')
    },
    ...mapActions(['login']),
    ...mapMutations(['setAccessToken', 'setRefreshToken', 'pushNotification'])
  },
  created () {
    this.finishedLoading = true
  }
})
</script>
