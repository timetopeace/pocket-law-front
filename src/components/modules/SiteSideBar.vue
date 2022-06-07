<template lang="pug">
aside.site-side-bar
  nav.site-side-bar__nav(v-if="getAvailableSections().length")
    RouterLink.site-side-bar__item(
      v-for="item in getAvailableSections()"
      :key="item.title"
      :to="item.link"
      :class="{ 'site-side-bar__item--selected': isSelected(item) }"
    ) {{ item.title }}
      .site-side-bar__item-content-wrapper(v-if="getAvailableSubSections(item).length")
        RouterLink.site-side-bar__item(
          v-for="itemInner in getAvailableSubSections(item)"
          :key="itemInner.title"
          :to="itemInner.link"
          :class="{ 'site-side-bar__item--selected': isSelectedSub(itemInner) }"
        ) {{ itemInner.title }}
  .loading.loading--bright(v-else)
</template>

<script lang="ts">
import { mapGetters } from 'vuex'
import { defineComponent } from 'vue'
import { sections } from '@/utils/constants'
import { SideBarSection } from '@/interfaces'

export default defineComponent({
  computed: {
    ...mapGetters(['hasPermission'])
  },
  methods: {
    isSelected (item: SideBarSection) {
      return this.$router.currentRoute.value.fullPath.startsWith(item.link!)
    },
    isSelectedSub (item: SideBarSection) {
      return this.$router.currentRoute.value.fullPath.endsWith(item.link!)
    },
    getAvailableSubSections (section: SideBarSection) {
      const sections = section.subSections
        ? section.subSections!.filter(s => this.hasPermission(s.permission?.section, s.permission?.name))
        : []
      return sections.length > 1 ? sections : []
    },
    getAvailableSections (): SideBarSection[] {
      return sections.filter(s => this.hasPermission(s.permission?.section, s.permission?.name))
    }
  }
})
</script>
