<template lang="pug">
transition(name="fade" mode="out-in")
  component(:is="currentTemplate")
    RouterView(:key="$router.currentRoute.value.fullPath")
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import store from './store'
import AppTemplate from '@/templates/AppTemplate.vue'
import AuthTemplate from '@/templates/AuthTemplate.vue'

export default defineComponent({
  components: {
    AppTemplate,
    AuthTemplate
  },
  computed: {
    currentTemplate () {
      return store.getters.refreshToken ? 'AppTemplate' : 'AuthTemplate'
    }
  }
})
</script>

<style lang="stylus" rel="preload" src="./styles/index.styl"></style>
