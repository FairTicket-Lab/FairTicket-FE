<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Clock, Users, X, Loader2, CheckCircle } from 'lucide-vue-next'
import { useQueueStore } from '@/stores/queue.store'
import { usePolling } from '@/composables/usePolling'
import QueueProgress from '@/components/queue/QueueProgress.vue'

const route = useRoute()
const router = useRouter()
const queueStore = useQueueStore()

const concertId = route.params.concertId as string
const joining = ref(true)
const cancelling = ref(false)

// 3초 폴링
const { start: startPolling, stop: stopPolling } = usePolling(async () => {
  await queueStore.poll()
}, 3000)

// 30초 하트비트
const { start: startHeartbeat, stop: stopHeartbeat } = usePolling(async () => {
  await queueStore.heartbeat()
}, 30_000)

onMounted(async () => {
  try {
    await queueStore.join(concertId)
    startPolling()
    startHeartbeat()
  } finally {
    joining.value = false
  }
})

onUnmounted(() => {
  stopPolling()
  stopHeartbeat()
})

// 순번 도달 → 좌석 선택 페이지로 자동 이동
watch(
  () => queueStore.status,
  (status) => {
    if (status === 'ready') {
      stopPolling()
      stopHeartbeat()
      // 2초 뒤 이동 (사용자에게 안내 표시)
      setTimeout(() => {
        router.push(`/seats/${concertId}`)
      }, 2000)
    }
  }
)

async function handleCancel() {
  cancelling.value = true
  await queueStore.cancel()
  router.push(`/concerts/${concertId}`)
}
</script>

<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-lg">
      <!-- 대기열 진입 중 -->
      <div v-if="joining" class="flex flex-col items-center text-center">
        <Loader2 class="w-12 h-12 animate-spin text-primary mb-6" />
        <h2 class="font-display text-2xl font-bold text-foreground mb-2">대기열 진입 중...</h2>
        <p class="text-muted-foreground">잠시만 기다려주세요</p>
      </div>

      <!-- 순번 도달 -->
      <div
        v-else-if="queueStore.status === 'ready'"
        class="flex flex-col items-center text-center"
      >
        <div class="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
          <CheckCircle class="w-8 h-8 text-emerald-400" />
        </div>
        <h2 class="font-display text-2xl font-bold text-foreground mb-2">순번이 도달했습니다!</h2>
        <p class="text-muted-foreground">좌석 선택 페이지로 이동합니다...</p>
      </div>

      <!-- 대기 중 -->
      <template v-else>
        <div class="rounded-xl border border-border bg-card p-6 md:p-8">
          <!-- 헤더 -->
          <div class="flex flex-col items-center text-center mb-8">
            <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Users class="w-8 h-8 text-primary" />
            </div>
            <h2 class="font-display text-2xl font-bold text-foreground mb-1">대기열</h2>
            <p class="text-sm text-muted-foreground">
              순번이 되면 자동으로 좌석 선택 페이지로 이동합니다
            </p>
          </div>

          <!-- 현재 순번 강조 -->
          <div class="text-center mb-8">
            <p class="text-xs text-muted-foreground uppercase tracking-wider mb-1">현재 순번</p>
            <p class="font-display text-5xl md:text-6xl font-bold text-primary">
              {{ queueStore.position.toLocaleString() }}
            </p>
          </div>

          <!-- 프로그레스 -->
          <QueueProgress
            :position="queueStore.position"
            :total-ahead="queueStore.entry?.totalAhead ?? queueStore.position"
            :estimated-wait-seconds="queueStore.estimatedWait"
          />

          <!-- 안내 -->
          <div class="mt-6 flex items-start gap-2 p-3 rounded-lg bg-secondary">
            <Clock class="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <p class="text-xs text-muted-foreground leading-relaxed">
              이 페이지를 벗어나면 대기열에서 이탈됩니다.
              페이지를 유지해주세요.
            </p>
          </div>

          <!-- 취소 -->
          <button
            :disabled="cancelling"
            class="mt-6 w-full h-11 rounded-full border border-border text-muted-foreground text-sm font-medium hover:bg-secondary hover:text-foreground transition-colors flex items-center justify-center gap-2"
            @click="handleCancel"
          >
            <X class="w-4 h-4" />
            {{ cancelling ? '취소 중...' : '대기 취소' }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
