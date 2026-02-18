<script setup lang="ts">
import { ref } from 'vue'
import { Menu, X, User, LogOut } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()
const mobileOpen = ref(false)

const navLinks = [
  { label: 'Concerts', to: '/concerts' },
  { label: 'My Tickets', to: '/my/tickets' },
]
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border"
  >
    <div class="mx-auto max-w-7xl flex items-center justify-between px-4 h-16 lg:px-8">
      <!-- 좌측: 로고 + 네비 -->
      <div class="flex items-center gap-8">
        <RouterLink to="/concerts" class="flex items-center gap-1.5">
          <img
            src="/images/FairTicket logo.png"
            alt="FairTicket"
            class="h-24 w-auto"
          />
          <span class="font-display text-xl font-bold tracking-tight text-foreground">
            FairTicket
          </span>
        </RouterLink>

        <nav class="hidden md:flex items-center gap-6">
          <RouterLink
            v-for="link in navLinks"
            :key="link.label"
            :to="link.to"
            class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {{ link.label }}
          </RouterLink>
        </nav>
      </div>

      <!-- 우측: 인증 버튼 -->
      <div class="flex items-center gap-3">
        <template v-if="authStore.isLoggedIn">
          <span class="hidden md:inline text-sm text-muted-foreground">
            {{ authStore.user?.name || authStore.user?.email }}
          </span>
          <button
            class="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            @click="authStore.logout()"
          >
            <LogOut class="w-5 h-5" />
          </button>
        </template>
        <template v-else>
          <RouterLink
            to="/login"
            class="hidden md:flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <User class="w-4 h-4" />
            Login
          </RouterLink>
          <RouterLink
            to="/signup"
            class="hidden md:inline-flex h-9 px-4 items-center rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Sign Up
          </RouterLink>
        </template>

        <!-- 모바일 메뉴 토글 -->
        <button
          class="md:hidden p-2 text-muted-foreground hover:text-foreground"
          @click="mobileOpen = !mobileOpen"
        >
          <X v-if="mobileOpen" class="w-5 h-5" />
          <Menu v-else class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- 모바일 메뉴 -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="mobileOpen"
        class="md:hidden border-t border-border bg-background/95 backdrop-blur-xl"
      >
        <nav class="flex flex-col px-4 py-4 gap-1">
          <RouterLink
            v-for="link in navLinks"
            :key="link.label"
            :to="link.to"
            class="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
            @click="mobileOpen = false"
          >
            {{ link.label }}
          </RouterLink>
          <div class="border-t border-border mt-2 pt-2">
            <template v-if="authStore.isLoggedIn">
              <div class="px-3 py-2 text-sm text-foreground font-medium">
                {{ authStore.user?.name ?? authStore.user?.email }}
              </div>
              <button
                class="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
                @click="authStore.logout(); mobileOpen = false"
              >
                <LogOut class="w-4 h-4" />
                Logout
              </button>
            </template>
            <template v-else>
              <RouterLink
                to="/login"
                class="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
                @click="mobileOpen = false"
              >
                <User class="w-4 h-4" />
                Login
              </RouterLink>
            </template>
          </div>
        </nav>
      </div>
    </Transition>
  </header>
</template>
