<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Clock, Loader2, ArrowRight } from 'lucide-vue-next'
import type { Concert } from '@/types/concert'
import type { Seat, SeatSection } from '@/types/seat'
import { concertApi } from '@/api/concert.api'
import { seatApi } from '@/api/seat.api'
import { reservationApi } from '@/api/reservation.api'
import { usePaymentStore } from '@/stores/payment.store'
import { useQueueStore } from '@/stores/queue.store'
import { useCountdown } from '@/composables/useCountdown'
import SeatMap from '@/components/seat/SeatMap.vue'

const route = useRoute()
const router = useRouter()
const paymentStore = usePaymentStore()
const queueStore = useQueueStore()

const concertId = route.params.concertId as string
const concert = ref<Concert | null>(null)
const sections = ref<SeatSection[]>([])
const selectedSeat = ref<Seat | null>(null)
const loading = ref(true)
const submitting = ref(false)

// 10분 홀드 타이머
const holdExpiry = ref<string>(new Date(Date.now() + 10 * 60 * 1000).toISOString())
const countdown = useCountdown(holdExpiry.value)

onMounted(async () => {
  try {
    concert.value = (await concertApi.getById(concertId)) ?? null
    const dateId = concert.value?.dates.find((d) => d.available)?.id ?? ''
    sections.value = await seatApi.getSeatMap(concertId, dateId)
    countdown.start()
  } finally {
    loading.value = false
  }
})

// 타이머 만료 시 돌려보냄
watch(countdown.isExpired, (expired) => {
  if (expired) router.push(`/concerts/${concertId}`)
})

const selectedDate = computed(() => concert.value?.dates.find((d) => d.available))
const selectedGrade = computed(() => {
  if (!selectedSeat.value || !concert.value) return null
  return concert.value.grades.find((g) => g.id === selectedSeat.value!.gradeId)
})

function handleSelect(seat: Seat) {
  selectedSeat.value = selectedSeat.value?.id === seat.id ? null : seat
}

async function handleSubmit() {
  if (!concert.value || !selectedSeat.value || !selectedGrade.value || !selectedDate.value) return
  submitting.value = true
  try {
    const reservation = await reservationApi.create({
      concertId: concert.value.id,
      concertTitle: concert.value.title,
      dateId: selectedDate.value.id,
      track: 'realtime',
      gradeId: selectedGrade.value.id,
      gradeLabel: selectedGrade.value.label,
      unitPrice: selectedGrade.value.price,
      quantity: 1,
      seatId: selectedSeat.value.id,
    })
    paymentStore.setReservation(reservation)
    queueStore.reset()
    router.push(`/payment/${reservation.id}`)
  } finally {
    submitting.value = false
  }
}

const legendItems = [
  { label: 'VIP', color: '#7C3AED' },
  { label: 'R석', color: '#2563EB' },
  { label: 'S석', color: '#059669' },
  { label: 'A석', color: '#D97706' },
  { label: '선택', color: '#EC4899' },
  { label: '홀드', color: '#52525B' },
  { label: '매진', color: '#27272A' },
]
</script>

<template>
  <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
    <Loader2 class="w-8 h-8 animate-spin text-primary" />
  </div>

  <div v-else class="px-4 lg:px-8 mx-auto max-w-7xl py-8">
    <!-- 헤더 + 타이머 -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="font-display text-2xl font-bold text-foreground">좌석 선택</h1>
        <p class="text-sm text-muted-foreground">{{ concert?.title }}</p>
      </div>
      <div class="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card">
        <Clock class="w-4 h-4 text-primary" />
        <span class="font-display font-bold text-foreground" :class="countdown.remaining.value < 60 ? 'text-destructive' : ''">
          {{ countdown.display.value }}
        </span>
        <span class="text-xs text-muted-foreground">남음</span>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- 좌석맵 -->
      <div class="lg:col-span-3">
        <div class="rounded-xl border border-border bg-card p-4 md:p-6">
          <!-- 범례 -->
          <div class="flex flex-wrap gap-3 mb-4">
            <div v-for="item in legendItems" :key="item.label" class="flex items-center gap-1.5">
              <span class="w-4 h-4 rounded" :style="{ backgroundColor: item.color }" />
              <span class="text-xs text-muted-foreground">{{ item.label }}</span>
            </div>
          </div>

          <SeatMap
            :sections="sections"
            :selected-seat-id="selectedSeat?.id ?? null"
            @select="handleSelect"
          />
        </div>
      </div>

      <!-- 사이드바 -->
      <div class="lg:col-span-1">
        <div class="sticky top-24 rounded-xl border border-border bg-card p-6">
          <h3 class="font-display text-lg font-bold text-foreground mb-4">선택 좌석</h3>

          <div v-if="!selectedSeat" class="text-center py-8 text-sm text-muted-foreground">
            좌석을 클릭해 선택하세요
          </div>

          <template v-else>
            <div class="space-y-3 mb-4">
              <div>
                <p class="text-xs text-muted-foreground uppercase tracking-wider mb-1">좌석</p>
                <p class="text-sm font-medium text-foreground">
                  {{ selectedSeat.section.toUpperCase() }}구역
                  {{ selectedSeat.row }}열 {{ selectedSeat.number }}번
                </p>
              </div>
              <div v-if="selectedGrade">
                <p class="text-xs text-muted-foreground uppercase tracking-wider mb-1">등급</p>
                <p class="text-sm text-foreground">{{ selectedGrade.label }}</p>
              </div>
            </div>

            <div class="h-px bg-border my-4" />

            <div class="flex items-center justify-between mb-6">
              <span class="font-display font-bold text-foreground">합계</span>
              <span class="font-display text-xl font-bold text-foreground">
                ₩{{ selectedGrade?.price.toLocaleString() }}
              </span>
            </div>

            <button
              :disabled="submitting"
              class="w-full h-12 rounded-full bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              @click="handleSubmit"
            >
              <Loader2 v-if="submitting" class="w-4 h-4 animate-spin" />
              <template v-else>
                결제하기
                <ArrowRight class="w-4 h-4" />
              </template>
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
