<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'

const auth = useAuthStore()
const router = useRouter()

onMounted(() => {
  if (!auth.isLoggedIn) {
    router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
  }
})
</script>

<template>
  <slot v-if="auth.isLoggedIn" />
</template>
