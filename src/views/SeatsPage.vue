<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Clock, Loader2, ArrowRight, ArrowLeft } from 'lucide-vue-next'
import type { Concert } from '@/types/concert'
import type { Seat, SeatSection, VenueSectionInfo } from '@/types/seat'
import { concertApi } from '@/api/concert.api'
import { seatApi } from '@/api/seat.api'
import { reservationApi } from '@/api/reservation.api'
import { usePaymentStore } from '@/stores/payment.store'
import { useQueueStore } from '@/stores/queue.store'
import { useCountdown } from '@/composables/useCountdown'
import VenueMap from '@/components/seat/VenueMap.vue'
import SeatMap from '@/components/seat/SeatMap.vue'

const route = useRoute()
const router = useRouter()
const paymentStore = usePaymentStore()
const queueStore = useQueueStore()

const concertId = route.params.concertId as string
const concert = ref<Concert | null>(null)
const venueSections = ref<VenueSectionInfo[]>([])
const seatSections = ref<SeatSection[]>([])
const selectedSectionId = ref<string | null>(null)
const selectedSeat = ref<Seat | null>(null)
const step = ref<'venue' | 'seats'>('venue')
const loading = ref(true)
const loadingSeats = ref(false)
const submitting = ref(false)

// 10분 홀드 타이머
const holdExpiry = ref<string>(new Date(Date.now() + 10 * 60 * 1000).toISOString())
const countdown = useCountdown(holdExpiry.value)

onMounted(async () => {
  try {
    concert.value = (await concertApi.getById(concertId)) ?? null
    const dateId = concert.value?.dates.find((d) => d.available)?.id ?? ''
    venueSections.value = await seatApi.getVenueSections(concertId, dateId)
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

async function handleSectionSelect(sectionId: string, _grade: string) {
  selectedSectionId.value = sectionId
  selectedSeat.value = null
  loadingSeats.value = true
  try {
    const dateId = selectedDate.value?.id ?? ''
    seatSections.value = await seatApi.getSectionSeats(concertId, dateId, sectionId)
    step.value = 'seats'
  } finally {
    loadingSeats.value = false
  }
}

function handleBackToVenue() {
  step.value = 'venue'
  selectedSeat.value = null
  seatSections.value = []
}

function handleSeatSelect(seat: Seat) {
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
  { label: 'VIP', color: '#7B3FA0' },
  { label: 'S석', color: '#8B9EC8' },
  { label: 'A석', color: '#D4884E' },
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
      <div class="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card">
        <Clock class="w-4 h-4 text-primary" />
        <span
          class="font-display font-bold text-foreground"
          :class="countdown.remaining.value < 60 ? 'text-destructive' : ''"
        >
          {{ countdown.display.value }}
        </span>
        <span class="text-xs text-muted-foreground">남음</span>
      </div>
    </div>

    <!-- Step 1: Venue Map -->
    <div v-if="step === 'venue'" class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div class="lg:col-span-3">
        <div class="rounded-xl border border-border bg-card p-2 md:p-4">
          <VenueMap
            :selected-section-id="selectedSectionId"
            :sections="venueSections"
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
          <div class="h-px bg-border my-4" />
          <p class="text-xs text-muted-foreground leading-relaxed">
            원하시는 구역을 클릭하면<br />해당 구역의 좌석을 선택할 수 있습니다.
          </p>
          <div v-if="loadingSeats" class="mt-4 flex items-center justify-center py-4">
            <Loader2 class="w-5 h-5 animate-spin text-primary" />
          </div>
        </div>
      </div>
    </div>

    <!-- Step 2: Seat Selection -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div class="lg:col-span-3">
        <div class="rounded-xl border border-border bg-card p-4 md:p-6">
          <!-- Legend -->
          <div class="flex flex-wrap gap-3 mb-4">
            <div v-for="item in legendItems" :key="item.label" class="flex items-center gap-1.5">
              <span class="w-4 h-4 rounded" :style="{ backgroundColor: item.color }" />
              <span class="text-xs text-muted-foreground">{{ item.label }}</span>
            </div>
          </div>

          <SeatMap
            :sections="seatSections"
            :selected-seat-id="selectedSeat?.id ?? null"
            :section-label="`${selectedSectionId}구역`"
            @select="handleSeatSelect"
          />
        </div>
      </div>

      <div class="lg:col-span-1">
        <div class="sticky top-24 rounded-xl border border-border bg-card p-6">
          <h3 class="font-display text-lg font-bold text-foreground mb-4">선택 좌석</h3>

          <div v-if="!selectedSeat" class="text-center py-8 text-sm text-muted-foreground">
            좌석을 클릭해 선택하세요
          </div>

          <template v-else>
            <div class="space-y-3 mb-4">
              <div>
                <p class="text-xs text-muted-foreground uppercase tracking-wider mb-1">구역</p>
                <p class="text-sm font-medium text-foreground">{{ selectedSeat.section }}구역</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground uppercase tracking-wider mb-1">좌석</p>
                <p class="text-sm font-medium text-foreground">
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
