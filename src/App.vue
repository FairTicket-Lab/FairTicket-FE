<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SiteHeader from '@/components/layout/SiteHeader.vue'
import SiteFooter from '@/components/layout/SiteFooter.vue'
import AppToast from '@/components/ui/AppToast.vue'

const route = useRoute()
const isFullscreen = computed(() => !!route.meta.fullscreen)
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <SiteHeader v-if="!isFullscreen" />
    <main :class="isFullscreen ? 'flex-1' : 'flex-1 pt-16'">
      <RouterView v-slot="{ Component, route: viewRoute }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="viewRoute.fullPath" />
        </Transition>
      </RouterView>
    </main>
    <SiteFooter v-if="!isFullscreen" />
    <AppToast />
  </div>
</template>
