<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Clock, Users, X, Loader2, CheckCircle, Sparkles } from 'lucide-vue-next'
import { useQueueStore } from '@/stores/queue.store'
import { usePolling } from '@/composables/usePolling'
import QueueProgress from '@/components/queue/QueueProgress.vue'
import FlipNumber from '@/components/ui/FlipNumber.vue'

const route = useRoute()
const router = useRouter()
const queueStore = useQueueStore()

const concertId = route.params.concertId as string
const track = (route.query.track as string) || 'live'
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
      const destination = track === 'lottery'
        ? `/lottery/${concertId}`
        : `/seats/${concertId}`
      setTimeout(() => {
        router.push(destination)
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
        <div class="relative">
          <div class="absolute inset-0 rounded-full bg-primary/20 animate-ping" style="animation-duration: 1.5s" />
          <div class="relative w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 class="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
        <h2 class="font-display text-2xl font-bold text-foreground mb-2 mt-6">대기열 진입 중...</h2>
        <p class="text-muted-foreground">잠시만 기다려주세요</p>
      </div>

      <!-- 순번 도달 -->
      <div
        v-else-if="queueStore.status === 'ready'"
        class="flex flex-col items-center text-center"
      >
        <div class="relative">
          <div class="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" style="animation-duration: 1s" />
          <div class="relative w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle class="w-10 h-10 text-emerald-400" />
          </div>
        </div>
        <h2 class="font-display text-2xl font-bold text-foreground mb-2 mt-6">순번이 도달했습니다!</h2>
        <p class="text-muted-foreground">{{ track === 'lottery' ? '로터리 예매' : '좌석 선택' }} 페이지로 이동합니다...</p>
        <div class="flex items-center gap-1 mt-4 text-emerald-400">
          <Sparkles class="w-4 h-4" />
          <span class="text-sm font-medium">입장 준비 완료</span>
        </div>
      </div>

      <!-- 대기 중 -->
      <template v-else>
        <div class="rounded-xl border border-border bg-card p-6 md:p-8">
          <!-- 헤더 -->
          <div class="flex flex-col items-center text-center mb-8">
            <div class="relative">
              <div class="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
              <div class="relative w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Users class="w-8 h-8 text-primary" />
              </div>
            </div>
            <h2 class="font-display text-2xl font-bold text-foreground mb-1 mt-4">대기열</h2>
            <p class="text-sm text-muted-foreground">
              순번이 되면 자동으로 {{ track === 'lottery' ? '로터리 예매' : '좌석 선택' }} 페이지로 이동합니다
            </p>
          </div>

          <!-- 현재 순번 강조 (Flip Number) -->
          <div class="text-center mb-8">
            <p class="text-xs text-muted-foreground uppercase tracking-wider mb-2">현재 순번</p>
            <div class="font-display text-5xl md:text-6xl font-bold text-primary" style="perspective: 600px">
              <FlipNumber :value="queueStore.position" />
            </div>
            <p class="text-xs text-muted-foreground mt-2">번째 대기 중</p>
          </div>

          <!-- 프로그레스 -->
          <QueueProgress
            :position="queueStore.position"
            :total-ahead="queueStore.entry?.totalAhead ?? queueStore.position"
            :estimated-wait-seconds="queueStore.estimatedWait"
          />

          <!-- 실시간 표시 -->
          <div class="mt-6 grid grid-cols-2 gap-3">
            <div class="rounded-lg bg-secondary p-3 text-center">
              <p class="text-xs text-muted-foreground mb-1">내 앞 대기자</p>
              <p class="font-display font-bold text-foreground text-lg">
                <FlipNumber :value="Math.max(0, queueStore.position - 1)" />
              </p>
            </div>
            <div class="rounded-lg bg-secondary p-3 text-center">
              <p class="text-xs text-muted-foreground mb-1">예상 대기</p>
              <p class="font-display font-bold text-foreground text-lg">
                {{ queueStore.estimatedWait < 60
                  ? `${queueStore.estimatedWait}초`
                  : `${Math.ceil(queueStore.estimatedWait / 60)}분`
                }}
              </p>
            </div>
          </div>

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
