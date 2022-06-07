<template lang="pug">
header.site-header
  .site-header__left
    router-link(:to="'/'").site-header__logo
      | PocketLaw
  .site-header__right
    router-link(:to="$routes.auth.base" @click="logout").site-header__logout
      | Выйти
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapMutations } from 'vuex'

export default defineComponent({
  methods: {
    logout () {
      this.setAccessToken('')
      this.setRefreshToken('')
    },
    ...mapMutations(['setAccessToken', 'setRefreshToken'])
  }
})
</script>
