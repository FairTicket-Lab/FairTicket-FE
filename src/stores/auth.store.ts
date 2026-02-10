import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/auth'
import { authApi } from '@/api/auth.api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('access_token'))

  const isLoggedIn = computed(() => !!token.value)

  async function signup(email: string, password: string, name: string, phone: string) {
    const res = await authApi.signup({ email, password, name, phone })
    token.value = res.accessToken
    user.value = res.user
    localStorage.setItem('access_token', res.accessToken)
  }

  async function login(email: string, password: string) {
    const res = await authApi.login({ email, password })
    token.value = res.accessToken
    user.value = res.user
    localStorage.setItem('access_token', res.accessToken)
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('access_token')
  }

  return { user, token, isLoggedIn, signup, login, logout }
})
