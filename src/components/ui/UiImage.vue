<template lang="pug">
img(
  v-bind="$attrs"
  v-show="finishedLoading"
  @load="onLoad"
  @error="onError"
  :src="src"
)
.loading.loading--smaller(
  v-bind="$attrs"
  v-show="!finishedLoading"
)
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'UiImage',
  props: {
    src: {
      type: String
    }
  },
  data () {
    return {
      errored: false
    }
  },
  methods: {
    onLoad () {
      this.finishedLoading = true
    },
    onError () {
      this.finishedLoading = true
    }
  }
})
</script>
