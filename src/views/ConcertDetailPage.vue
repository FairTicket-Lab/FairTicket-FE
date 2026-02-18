<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  CalendarDays,
  MapPin,
  Clock,
  Check,
  ShoppingCart,
  Zap,
  Users,
  Loader2,
  ArrowRight,
  Lock,
} from 'lucide-vue-next'
import type { Concert, ConcertDate } from '@/types/concert'
import { concertApi } from '@/api/concert.api'
import { useAuthStore } from '@/stores/auth.store'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const concert = ref<Concert | null>(null)
const loading = ref(true)
const selectedDate = ref<ConcertDate | null>(null)

onMounted(async () => {
  try {
    const id = route.params.id as string
    concert.value = (await concertApi.getById(id)) ?? null
    if (concert.value) {
      selectedDate.value = concert.value.dates.find((d) => d.available) ?? null
    }
  } finally {
    loading.value = false
  }
})

const formattedSelectedDate = computed(() => {
  if (!selectedDate.value) return ''
  return new Date(selectedDate.value.date).toLocaleDateString('ko-KR', {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

function goToLottery() {
  if (!authStore.isLoggedIn) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }
  router.push(`/lottery/${concert.value!.id}`)
}

const activeTrack = computed(() => selectedDate.value?.activeTrack ?? undefined)
const isLotteryLocked = computed(() => activeTrack.value === 'live')
const isLiveLocked = computed(() => activeTrack.value === 'lottery')

function goToQueue() {
  if (!authStore.isLoggedIn) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }
  router.push(`/queue/${concert.value!.id}`)
}
</script>

<template>
  <div>
  <!-- 로딩 -->
  <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
    <Loader2 class="w-8 h-8 animate-spin text-primary" />
  </div>

  <!-- 404 -->
  <div v-else-if="!concert" class="flex flex-col items-center justify-center min-h-[60vh]">
    <h2 class="font-display text-2xl font-bold text-foreground mb-2">공연을 찾을 수 없습니다</h2>
    <RouterLink to="/concerts" class="text-primary hover:underline">홈으로 돌아가기</RouterLink>
  </div>

  <!-- 콘서트 상세 -->
  <template v-else>
    <!-- 히어로 배너 -->
    <div class="relative h-[35vh] min-h-[280px] overflow-hidden">
      <img
        :src="concert.image"
        :alt="concert.title"
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      <div class="absolute bottom-0 left-0 right-0 px-4 lg:px-8 pb-8 mx-auto max-w-7xl">
        <div class="flex items-center gap-3 mb-3">
          <span class="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-primary text-primary-foreground">
            {{ concert.category }}
          </span>
          <span
            v-if="concert.saleStatus === 'on-sale'"
            class="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
          >
            예매중
          </span>
          <span
            v-else-if="concert.saleStatus === 'coming-soon'"
            class="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30"
          >
            예매예정
          </span>
          <span
            v-else
            class="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-destructive/20 text-destructive border border-destructive/30"
          >
            매진
          </span>
        </div>
        <h1 class="font-display text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-1">
          {{ concert.title }}
        </h1>
        <p class="text-base md:text-lg text-muted-foreground">{{ concert.subtitle }}</p>
      </div>
    </div>

    <!-- 콘텐츠 -->
    <div class="px-4 lg:px-8 mx-auto max-w-7xl py-8 md:py-10">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
        <!-- 좌측: 공연 정보 -->
        <div class="lg:col-span-2 space-y-8">
          <!-- About -->
          <section>
            <h2 class="font-display text-xl font-bold text-foreground mb-4">공연 소개</h2>
            <p class="text-muted-foreground leading-relaxed">{{ concert.description }}</p>
            <div class="flex flex-wrap gap-2 mt-4">
              <span
                v-for="tag in concert.tags"
                :key="tag"
                class="px-2.5 py-1 text-xs rounded-md bg-secondary text-secondary-foreground"
              >
                {{ tag }}
              </span>
            </div>
          </section>

          <div class="h-px bg-border" />

          <!-- 일정 선택 -->
          <section>
            <div class="flex items-center gap-2 mb-4">
              <div class="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                1
              </div>
              <h2 class="font-display text-xl font-bold text-foreground">일정 선택</h2>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                v-for="date in concert.dates"
                :key="date.id"
                :disabled="!date.available"
                :class="[
                  'relative flex flex-col p-4 rounded-xl border text-left transition-all',
                  selectedDate?.id === date.id
                    ? 'border-primary bg-primary/10 ring-1 ring-primary'
                    : date.available
                      ? 'border-border bg-card hover:border-muted-foreground/30'
                      : 'border-border bg-card opacity-50 cursor-not-allowed',
                ]"
                @click="selectedDate = date"
              >
                <div
                  v-if="selectedDate?.id === date.id"
                  class="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check class="w-3 h-3 text-primary-foreground" />
                </div>
                <div class="flex items-center gap-2 mb-1">
                  <CalendarDays class="w-4 h-4 text-primary" />
                  <span class="font-semibold text-foreground text-sm">
                    {{ new Date(date.date).toLocaleDateString('ko-KR', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) }}
                  </span>
                </div>
                <div class="flex items-center gap-2 mb-1">
                  <Clock class="w-4 h-4 text-muted-foreground" />
                  <span class="text-muted-foreground text-sm">{{ date.time }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <MapPin class="w-4 h-4 text-muted-foreground" />
                  <span class="text-muted-foreground text-sm">{{ date.venue }}, {{ date.city }}</span>
                </div>
                <span
                  v-if="!date.available"
                  class="mt-2 px-2 py-0.5 text-xs rounded-full bg-destructive/20 text-destructive w-fit"
                >
                  매진
                </span>
              </button>
            </div>
          </section>

          <div class="h-px bg-border" />

          <!-- 등급별 가격표 -->
          <section>
            <div class="flex items-center gap-2 mb-4">
              <div class="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                2
              </div>
              <h2 class="font-display text-xl font-bold text-foreground">등급별 가격</h2>
            </div>
            <div class="space-y-3">
              <div
                v-for="grade in concert.grades"
                :key="grade.id"
                class="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-card gap-3"
              >
                <div class="flex items-center gap-3">
                  <span
                    class="w-10 h-10 rounded-lg bg-primary/10 text-primary font-display font-bold text-sm flex items-center justify-center"
                  >
                    {{ grade.label }}
                  </span>
                  <div>
                    <div class="flex items-baseline gap-2">
                      <span class="font-display text-lg font-bold text-foreground">
                        ₩{{ grade.price.toLocaleString() }}
                      </span>
                      <span v-if="grade.originalPrice" class="text-sm text-muted-foreground line-through">
                        ₩{{ grade.originalPrice.toLocaleString() }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users class="w-3.5 h-3.5" />
                    {{ grade.availableSeats }}/{{ grade.totalSeats }}
                  </div>
                  <!-- 잔여율 바 -->
                  <div class="w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all"
                      :class="grade.availableSeats / grade.totalSeats < 0.15 ? 'bg-amber-400' : 'bg-primary'"
                      :style="{ width: `${((grade.totalSeats - grade.availableSeats) / grade.totalSeats) * 100}%` }"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- 우측: 트랙 선택 -->
        <div class="lg:col-span-1">
          <div class="sticky top-24 space-y-4">
            <!-- 선택된 일정 요약 -->
            <div v-if="selectedDate" class="rounded-xl border border-border bg-card p-5">
              <p class="text-xs text-muted-foreground uppercase tracking-wider mb-1">선택 일정</p>
              <p class="text-sm font-medium text-foreground">{{ formattedSelectedDate }}</p>
              <p class="text-sm text-muted-foreground">
                {{ selectedDate.venue }}, {{ selectedDate.city }}
              </p>
            </div>

            <!-- 듀얼 트랙 선택 카드 -->
            <div class="rounded-xl border border-border bg-card p-6">
              <h3 class="font-display text-lg font-bold text-foreground mb-2">예매 방식 선택</h3>
              <p class="text-xs text-muted-foreground mb-5">
                원하는 예매 트랙을 선택하세요
              </p>

              <!-- 로터리 트랙 -->
              <button
                v-if="!isLotteryLocked"
                :disabled="concert.saleStatus !== 'on-sale'"
                class="w-full text-left p-4 rounded-xl border border-border bg-background hover:border-primary/40 hover:bg-primary/5 transition-all mb-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                @click="goToLottery"
              >
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <ShoppingCart class="w-5 h-5 text-primary" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <h4 class="font-display font-bold text-foreground text-sm">로터리 예매</h4>
                      <ArrowRight class="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p class="text-xs text-muted-foreground mt-1 leading-relaxed">
                      등급·수량만 선택하고 결제하면<br />좌석은 추후 랜덤 배정
                    </p>
                  </div>
                </div>
              </button>
              <!-- 로터리 트랙 (잠금) -->
              <div
                v-else
                class="w-full text-left p-4 rounded-xl border border-border bg-muted/30 mb-3 opacity-60 cursor-not-allowed"
              >
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Lock class="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="font-display font-bold text-muted-foreground text-sm">로터리 예매</h4>
                    <p class="text-xs text-muted-foreground mt-1 leading-relaxed">
                      🔒 로터리 트랙 예매 시간대 마감
                    </p>
                  </div>
                </div>
              </div>

              <!-- 라이브 트랙 -->
              <button
                v-if="!isLiveLocked"
                :disabled="concert.saleStatus !== 'on-sale'"
                class="w-full text-left p-4 rounded-xl border border-border bg-background hover:border-primary/40 hover:bg-primary/5 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                @click="goToQueue"
              >
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <Zap class="w-5 h-5 text-accent" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <h4 class="font-display font-bold text-foreground text-sm">라이브 예매</h4>
                      <ArrowRight class="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p class="text-xs text-muted-foreground mt-1 leading-relaxed">
                      대기열 → 좌석 직접 선택 → 결제<br />원하는 좌석을 직접 골라보세요
                    </p>
                  </div>
                </div>
              </button>
              <!-- 라이브 트랙 (잠금) -->
              <div
                v-else
                class="w-full text-left p-4 rounded-xl border border-border bg-muted/30 opacity-60 cursor-not-allowed"
              >
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Lock class="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="font-display font-bold text-muted-foreground text-sm">라이브 예매</h4>
                    <p class="text-xs text-muted-foreground mt-1 leading-relaxed">
                      🔒 정각에 오픈
                    </p>
                  </div>
                </div>
              </div>

              <!-- 예매 불가 상태 -->
              <div
                v-if="concert.saleStatus === 'coming-soon'"
                class="text-center py-3 mt-3"
              >
                <p class="text-sm text-amber-400 font-medium mb-1">예매 오픈 예정</p>
                <p v-if="concert.saleDate" class="text-xs text-muted-foreground">
                  {{ new Date(concert.saleDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' }) }}
                </p>
              </div>
              <div v-if="concert.saleStatus === 'sold-out'" class="text-center py-3 mt-3">
                <p class="text-sm text-destructive font-medium">전석 매진</p>
              </div>
            </div>

            <p class="text-xs text-muted-foreground text-center">
              티켓은 양도 및 환불이 불가합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  </template>
  </div>
</template>
