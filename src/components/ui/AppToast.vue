<script setup lang="ts">
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'

const { toasts, remove } = useToast()

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const styles = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  error: 'border-destructive/30 bg-destructive/10 text-destructive',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  info: 'border-primary/30 bg-primary/10 text-primary',
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-20 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <TransitionGroup
        enter-active-class="transition-all duration-300 ease-out"
        leave-active-class="transition-all duration-200 ease-in"
        enter-from-class="translate-x-full opacity-0"
        enter-to-class="translate-x-0 opacity-100"
        leave-from-class="translate-x-0 opacity-100"
        leave-to-class="translate-x-full opacity-0"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="styles[toast.type]"
          class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg min-w-[280px] max-w-[400px]"
        >
          <component :is="icons[toast.type]" class="w-5 h-5 shrink-0" />
          <span class="text-sm font-medium flex-1">{{ toast.message }}</span>
          <button
            class="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            @click="remove(toast.id)"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
