<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Mail, Lock, Loader2 } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    const redirect = (route.query.redirect as string) || '/concerts'
    router.push(redirect)
  } catch {
    error.value = '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-4rem)] flex">
    <!-- 좌측: 로고 브랜딩 (다크) -->
    <div class="hidden lg:flex w-1/2 items-center justify-center bg-background relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent" />
      <div class="relative flex flex-col items-center text-center px-12">
        <img src="/images/FairTicket logo.png" alt="FairTicket" class="h-72 w-auto mb-10" />
        <h2 class="font-display text-4xl font-bold text-foreground mb-3">FairTicket</h2>
        <p class="text-muted-foreground text-lg leading-relaxed max-w-sm">
          공정한 티켓팅의 시작.<br />모든 팬에게 동등한 기회를 제공합니다.
        </p>
      </div>
    </div>

    <!-- 우측: 로그인 폼 (화이트) -->
    <div class="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-background lg:bg-white">
      <div class="w-full max-w-md">
        <!-- 모바일에서만 로고 표시 -->
        <div class="flex flex-col items-center mb-8 lg:hidden">
          <img src="/images/FairTicket logo.png" alt="FairTicket" class="h-44 w-auto mb-4" />
        </div>

        <div class="mb-8 lg:mb-10">
          <h1 class="font-display text-2xl font-bold text-foreground lg:text-gray-900">Welcome Back</h1>
          <p class="text-sm text-muted-foreground lg:text-gray-500 mt-1">계정에 로그인하세요</p>
        </div>

        <form class="space-y-5" @submit.prevent="handleSubmit">
          <div
            v-if="error"
            class="rounded-lg bg-destructive/10 lg:bg-red-50 border border-destructive/30 lg:border-red-200 px-4 py-3 text-sm text-destructive lg:text-red-600"
          >
            {{ error }}
          </div>

          <div class="space-y-2">
            <label for="email" class="text-sm font-medium text-foreground lg:text-gray-700">이메일</label>
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground lg:text-gray-400" />
              <input
                id="email"
                v-model="email"
                type="email"
                required
                placeholder="name@example.com"
                class="w-full h-11 pl-10 pr-4 rounded-lg border border-input lg:border-gray-300 bg-background lg:bg-white text-foreground lg:text-gray-900 text-sm placeholder:text-muted-foreground lg:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ring lg:focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label for="password" class="text-sm font-medium text-foreground lg:text-gray-700">비밀번호</label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground lg:text-gray-400" />
              <input
                id="password"
                v-model="password"
                type="password"
                required
                placeholder="••••••••"
                class="w-full h-11 pl-10 pr-4 rounded-lg border border-input lg:border-gray-300 bg-background lg:bg-white text-foreground lg:text-gray-900 text-sm placeholder:text-muted-foreground lg:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ring lg:focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full h-11 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            {{ loading ? '로그인 중...' : '로그인' }}
          </button>

          <p class="text-center text-sm text-muted-foreground lg:text-gray-500">
            계정이 없으신가요?
            <RouterLink to="/signup" class="text-primary font-medium hover:underline">
              회원가입
            </RouterLink>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>
