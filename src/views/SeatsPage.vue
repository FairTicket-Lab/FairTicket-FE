<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Clock, Loader2, ArrowRight, ArrowLeft, ZoomIn, ZoomOut, Maximize2, X } from 'lucide-vue-next'
import type { Concert } from '@/types/concert'
import type { Seat, SeatSection, VenueSectionInfo } from '@/types/seat'
import type { ReservationSeatItem } from '@/types/reservation'
import { concertApi } from '@/api/concert.api'
import { seatApi } from '@/api/seat.api'
import { reservationApi } from '@/api/reservation.api'
import { usePaymentStore } from '@/stores/payment.store'
import { useQueueStore } from '@/stores/queue.store'
import { useSeatStore } from '@/stores/seat.store'
import { useCountdown } from '@/composables/useCountdown'
import VenueMap from '@/components/seat/VenueMap.vue'
import SeatMap from '@/components/seat/SeatMap.vue'

const route = useRoute()
const router = useRouter()
const paymentStore = usePaymentStore()
const queueStore = useQueueStore()
const seatStore = useSeatStore()

const concertId = route.params.concertId as string
const concert = ref<Concert | null>(null)
const venueSections = ref<VenueSectionInfo[]>([])
const seatSections = ref<SeatSection[]>([])
const selectedSectionId = ref<string | null>(null)
const step = ref<'venue' | 'seats'>('venue')
const loading = ref(true)
const loadingSeats = ref(false)
const submitting = ref(false)

// Zoom/Pan state
const zoom = ref(1)
const panX = ref(0)
const panY = ref(0)
const isPanning = ref(false)
const panStartX = ref(0)
const panStartY = ref(0)
const zoomContainer = ref<HTMLDivElement>()

function handleZoomIn() {
  zoom.value = Math.min(3, zoom.value + 0.3)
}

function handleZoomOut() {
  zoom.value = Math.max(1, zoom.value - 0.3)
}

function handleZoomReset() {
  zoom.value = 1
  panX.value = 0
  panY.value = 0
}

function handleWheel(e: WheelEvent) {
  e.preventDefault()
  const delta = e.deltaY > 0 ? -0.15 : 0.15
  zoom.value = Math.min(3, Math.max(1, zoom.value + delta))
}

function handlePointerDown(e: PointerEvent) {
  if (zoom.value <= 1) return
  isPanning.value = true
  panStartX.value = e.clientX - panX.value
  panStartY.value = e.clientY - panY.value
  ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
}

function handlePointerMove(e: PointerEvent) {
  if (!isPanning.value) return
  panX.value = e.clientX - panStartX.value
  panY.value = e.clientY - panStartY.value
}

function handlePointerUp() {
  isPanning.value = false
}

const transformStyle = computed(() => ({
  transform: `translate(${panX.value}px, ${panY.value}px) scale(${zoom.value})`,
  transformOrigin: 'center center',
}))

// 10분 홀드 타이머
const holdExpiry = ref<string>(new Date(Date.now() + 10 * 60 * 1000).toISOString())
const countdown = useCountdown(holdExpiry.value)

onMounted(async () => {
  seatStore.reset()
  try {
    concert.value = (await concertApi.getById(concertId)) ?? null
    const dateId = concert.value?.dates.find((d) => d.available)?.id ?? ''
    venueSections.value = await seatApi.getVenueSections(concert.value?.venue ?? '', String(dateId))
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

// 선택된 좌석의 등급별 가격 조회
function gradeOf(seat: Seat) {
  return concert.value?.grades.find((g) => g.id === seat.gradeId)
}

// 합계 금액
const totalPrice = computed(() =>
  seatStore.selectedSeats.reduce((sum, s) => sum + (gradeOf(s)?.price ?? 0), 0),
)

// 구역별 선택 수 (venue map 뱃지용)
const sectionSelectionCount = computed(() => {
  const map: Record<string, number> = {}
  for (const s of seatStore.selectedSeats) {
    map[s.section] = (map[s.section] ?? 0) + 1
  }
  return map
})

async function handleSectionSelect(sectionId: string, _grade: string) {
  selectedSectionId.value = sectionId
  loadingSeats.value = true
  handleZoomReset()
  try {
    const dateId = selectedDate.value?.id ?? ''
    seatSections.value = await seatApi.getSectionSeats(concert.value?.venue ?? '', String(dateId), sectionId)
    step.value = 'seats'
  } finally {
    loadingSeats.value = false
  }
}

function handleBackToVenue() {
  step.value = 'venue'
  seatSections.value = []
  handleZoomReset()
}

function handleSeatSelect(seat: Seat) {
  seatStore.toggleSeat(seat)
}

function removeSeat(seat: Seat) {
  seatStore.toggleSeat(seat)
}

async function handleSubmit() {
  if (!concert.value || seatStore.selectedSeats.length === 0 || !selectedDate.value) return
  submitting.value = true
  const scheduleId = String(selectedDate.value.id)

  try {
    const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

    if (USE_MOCK) {
      const seats: ReservationSeatItem[] = seatStore.selectedSeats.map((s) => {
        const grade = gradeOf(s)
        return { seatId: s.id, section: s.section, row: s.row, number: s.number, gradeId: s.gradeId, gradeLabel: grade?.label ?? s.gradeId, unitPrice: grade?.price ?? 0 }
      })
      const firstGrade = gradeOf(seatStore.selectedSeats[0])
      const reservation = await reservationApi.create({
        concertId: concert.value.id, concertTitle: concert.value.title, dateId: selectedDate.value.id,
        track: 'live', gradeId: firstGrade?.id ?? '', gradeLabel: seats.map((s) => s.gradeLabel).join(', '),
        unitPrice: firstGrade?.price ?? 0, quantity: seats.length, seats,
      })
      paymentStore.setReservation(reservation)
      queueStore.reset()
      router.push(`/payment/${reservation.id}`)
      return
    }

    // BE 연동: 좌석마다 seatApi.selectSeat 호출
    let lastResponse: import('@/api/seat.api').SeatSelectionResponse | null = null
    for (const seat of seatStore.selectedSeats) {
      const grade = (seat.gradeId ?? '').toUpperCase()
      const zone = seat.section
      const seatNumber = String(seat.number)
      lastResponse = await seatApi.selectSeat(scheduleId, grade, zone, seatNumber)
    }

    // pending 예약 조회
    const { data: pendingRes } = await (await import('@/api/client')).default.get(
      `/v1/reservations/pending`, { params: { scheduleId } },
    )
    const reservationId = String(pendingRes.id)
    const firstGrade = gradeOf(seatStore.selectedSeats[0])
    const seats: ReservationSeatItem[] = seatStore.selectedSeats.map((s) => {
      const grade = gradeOf(s)
      return { seatId: s.id, section: s.section, row: s.row, number: s.number, gradeId: s.gradeId, gradeLabel: grade?.label ?? s.gradeId, unitPrice: grade?.price ?? 0 }
    })

    paymentStore.setReservation({
      id: reservationId,
      concertId: concert.value.id,
      concertTitle: concert.value.title,
      dateId: scheduleId,
      track: 'live',
      gradeId: firstGrade?.id ?? '',
      gradeLabel: seats.map((s) => s.gradeLabel).join(', '),
      quantity: seatStore.selectedSeats.length,
      unitPrice: firstGrade?.price ?? 0,
      totalPrice: totalPrice.value,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: lastResponse?.paymentDeadline ?? new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      seats,
    })
    queueStore.reset()
    router.push(`/payment/${reservationId}`)
  } finally {
    submitting.value = false
  }
}

const legendItems = [
  { label: 'VIP', color: '#7B3FA0' },
  { label: 'S석', color: '#8B9EC8' },
  { label: 'A석', color: '#D4884E' },
  { label: '선택', color: '#EC4899' },
  { label: '홀드', color: '#52525B' },
  { label: '매진', color: '#27272A' },
]
</script>

<template>
  <div>
  <!-- 로딩: Skeleton -->
  <div v-if="loading" class="px-4 lg:px-8 mx-auto max-w-7xl py-8">
    <div class="flex justify-between mb-6">
      <div class="space-y-2">
        <div class="h-7 w-40 skeleton rounded" />
        <div class="h-4 w-24 skeleton rounded" />
      </div>
      <div class="h-10 w-32 skeleton rounded-full" />
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div class="lg:col-span-3 h-[500px] skeleton rounded-xl" />
      <div class="h-64 skeleton rounded-xl" />
    </div>
  </div>

  <div v-else class="px-4 lg:px-8 mx-auto max-w-7xl py-8">
    <!-- Header + Timer -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div class="flex items-center gap-3">
        <button
          v-if="step === 'seats'"
          class="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          @click="handleBackToVenue"
        >
          <ArrowLeft class="w-4 h-4" />
          구역 선택
        </button>
        <div>
          <h1 class="font-display text-2xl font-bold text-foreground">
            {{ step === 'venue' ? '구역 선택' : `${selectedSectionId}구역 좌석 선택` }}
          </h1>
          <p class="text-sm text-muted-foreground">{{ concert?.title }}</p>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <!-- 선택 카운터 -->
        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card text-sm">
          <span class="font-display font-bold" :class="seatStore.isFull ? 'text-destructive' : 'text-foreground'">
            {{ seatStore.selectedSeats.length }}
          </span>
          <span class="text-muted-foreground">/ {{ seatStore.MAX_SEATS }}석</span>
        </div>
        <div class="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card">
          <Clock class="w-4 h-4 text-primary" />
          <span
            class="font-display font-bold text-foreground"
            :class="countdown.remaining.value < 60 ? 'text-destructive animate-pulse' : ''"
          >
            {{ countdown.display.value }}
          </span>
          <span class="text-xs text-muted-foreground">남음</span>
        </div>
      </div>
    </div>

    <!-- Step 1: Venue Map -->
    <div v-if="step === 'venue'" class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div class="lg:col-span-3">
        <div class="rounded-xl border border-border bg-card p-2 md:p-4">
          <VenueMap
            :selected-section-id="selectedSectionId"
            :sections="venueSections"
            :section-badges="sectionSelectionCount"
            @select="handleSectionSelect"
          />
        </div>
      </div>

      <div class="lg:col-span-1">
        <div class="sticky top-24 rounded-xl border border-border bg-card p-6">
          <h3 class="font-display text-lg font-bold text-foreground mb-4">구역 안내</h3>
          <div class="space-y-3 text-sm">
            <div class="flex items-center gap-2">
              <span class="w-4 h-4 rounded" style="background-color: #7b3fa0" />
              <span class="text-muted-foreground">VIP석 (FLOOR)</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-4 h-4 rounded" style="background-color: #8b9ec8" />
              <span class="text-muted-foreground">S석 (1F)</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-4 h-4 rounded" style="background-color: #d4884e" />
              <span class="text-muted-foreground">A석 (2F)</span>
            </div>
          </div>

          <!-- 선택된 좌석 목록 (구역 선택 화면에서도 표시) -->
          <template v-if="seatStore.selectedSeats.length > 0">
            <div class="h-px bg-border my-4" />
            <h4 class="text-sm font-semibold text-foreground mb-2">
              선택한 좌석 ({{ seatStore.selectedSeats.length }}/{{ seatStore.MAX_SEATS }})
            </h4>
            <div class="space-y-2 max-h-48 overflow-y-auto">
              <div
                v-for="seat in seatStore.selectedSeats"
                :key="seat.id"
                class="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary text-sm"
              >
                <div>
                  <span class="font-medium text-foreground">{{ seat.section }}구역 {{ seat.row }}열 {{ seat.number }}번</span>
                  <span class="ml-1.5 text-xs text-muted-foreground">{{ gradeOf(seat)?.label }}</span>
                </div>
                <button class="text-muted-foreground hover:text-destructive transition-colors" @click="removeSeat(seat)">
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div class="h-px bg-border my-4" />
            <div class="flex items-center justify-between mb-4">
              <span class="font-display font-bold text-foreground">합계</span>
              <span class="font-display text-xl font-bold text-foreground">
                ₩{{ totalPrice.toLocaleString() }}
              </span>
            </div>
            <button
              :disabled="submitting"
              class="w-full h-12 rounded-full bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-50"
              @click="handleSubmit"
            >
              <Loader2 v-if="submitting" class="w-4 h-4 animate-spin" />
              <template v-else>
                결제하기
                <ArrowRight class="w-4 h-4" />
              </template>
            </button>
          </template>

          <template v-else>
            <div class="h-px bg-border my-4" />
            <p class="text-xs text-muted-foreground leading-relaxed">
              원하시는 구역을 클릭하면<br />해당 구역의 좌석을 선택할 수 있습니다.
            </p>
          </template>

          <div v-if="loadingSeats" class="mt-4 flex items-center justify-center py-4">
            <Loader2 class="w-5 h-5 animate-spin text-primary" />
          </div>
        </div>
      </div>
    </div>

    <!-- Step 2: Seat Selection with Zoom/Pan -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div class="lg:col-span-3">
        <div class="rounded-xl border border-border bg-card p-4 md:p-6">
          <!-- Legend + Zoom Controls -->
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div class="flex flex-wrap gap-3">
              <div v-for="item in legendItems" :key="item.label" class="flex items-center gap-1.5">
                <span class="w-4 h-4 rounded" :style="{ backgroundColor: item.color }" />
                <span class="text-xs text-muted-foreground">{{ item.label }}</span>
              </div>
            </div>
            <!-- Zoom controls -->
            <div class="flex items-center gap-1">
              <button
                class="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                @click="handleZoomOut"
                title="축소"
              >
                <ZoomOut class="w-4 h-4 text-foreground" />
              </button>
              <span class="text-xs text-muted-foreground w-12 text-center font-mono">
                {{ Math.round(zoom * 100) }}%
              </span>
              <button
                class="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                @click="handleZoomIn"
                title="확대"
              >
                <ZoomIn class="w-4 h-4 text-foreground" />
              </button>
              <button
                class="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors ml-1"
                @click="handleZoomReset"
                title="초기화"
              >
                <Maximize2 class="w-4 h-4 text-foreground" />
              </button>
            </div>
          </div>

          <!-- 4석 꽉 참 안내 -->
          <div
            v-if="seatStore.isFull"
            class="mb-4 px-4 py-2.5 rounded-lg bg-primary/10 border border-primary/20 text-sm text-primary font-medium text-center"
          >
            최대 {{ seatStore.MAX_SEATS }}석까지 선택 가능합니다. 변경하려면 기존 좌석을 해제하세요.
          </div>

          <!-- Zoomable container -->
          <div
            ref="zoomContainer"
            class="zoom-container rounded-lg"
            @wheel.prevent="handleWheel"
            @pointerdown="handlePointerDown"
            @pointermove="handlePointerMove"
            @pointerup="handlePointerUp"
            @pointerleave="handlePointerUp"
          >
            <div :style="transformStyle" class="transition-transform duration-100">
              <SeatMap
                :sections="seatSections"
                :selected-seat-ids="seatStore.selectedSeatIds"
                :section-label="`${selectedSectionId}구역`"
                @select="handleSeatSelect"
              />
            </div>
          </div>

          <p v-if="zoom > 1" class="text-xs text-muted-foreground text-center mt-2">
            드래그로 이동 | 스크롤로 확대/축소
          </p>
        </div>
      </div>

      <div class="lg:col-span-1">
        <div class="sticky top-24 rounded-xl border border-border bg-card p-6">
          <h3 class="font-display text-lg font-bold text-foreground mb-4">
            선택 좌석
            <span class="text-sm font-normal text-muted-foreground ml-1">
              ({{ seatStore.selectedSeats.length }}/{{ seatStore.MAX_SEATS }})
            </span>
          </h3>

          <div v-if="seatStore.selectedSeats.length === 0" class="text-center py-8 text-sm text-muted-foreground">
            좌석을 클릭해 선택하세요<br />
            <span class="text-xs">등급 상관없이 최대 {{ seatStore.MAX_SEATS }}석</span>
          </div>

          <template v-else>
            <div class="space-y-2 max-h-56 overflow-y-auto mb-4">
              <div
                v-for="seat in seatStore.selectedSeats"
                :key="seat.id"
                class="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary"
              >
                <div class="min-w-0">
                  <p class="text-sm font-medium text-foreground truncate">
                    {{ seat.section }}구역 {{ seat.row }}열 {{ seat.number }}번
                  </p>
                  <p class="text-xs text-muted-foreground">
                    {{ gradeOf(seat)?.label }} · ₩{{ (gradeOf(seat)?.price ?? 0).toLocaleString() }}
                  </p>
                </div>
                <button
                  class="ml-2 flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                  @click="removeSeat(seat)"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div class="h-px bg-border my-4" />

            <div class="flex items-center justify-between mb-6">
              <span class="font-display font-bold text-foreground">합계</span>
              <span class="font-display text-xl font-bold text-foreground">
                ₩{{ totalPrice.toLocaleString() }}
              </span>
            </div>

            <button
              :disabled="submitting"
              class="w-full h-12 rounded-full bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-50"
              @click="handleSubmit"
            >
              <Loader2 v-if="submitting" class="w-4 h-4 animate-spin" />
              <template v-else>
                결제하기 ({{ seatStore.selectedSeats.length }}석)
                <ArrowRight class="w-4 h-4" />
              </template>
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>
