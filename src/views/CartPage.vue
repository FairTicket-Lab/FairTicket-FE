<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ShoppingCart, Minus, Plus, Info, Loader2, ArrowRight } from 'lucide-vue-next'
import type { Concert, TicketGrade } from '@/types/concert'
import { concertApi } from '@/api/concert.api'
import { reservationApi } from '@/api/reservation.api'
import { usePaymentStore } from '@/stores/payment.store'

const route = useRoute()
const router = useRouter()
const paymentStore = usePaymentStore()

const concertId = route.params.concertId as string
const concert = ref<Concert | null>(null)
const loading = ref(true)
const submitting = ref(false)

const selectedGrade = ref<TicketGrade | null>(null)
const quantity = ref(1)

onMounted(async () => {
  try {
    concert.value = (await concertApi.getById(concertId)) ?? null
  } finally {
    loading.value = false
  }
})

const totalPrice = computed(() => {
  if (!selectedGrade.value) return 0
  return selectedGrade.value.price * quantity.value
})

const selectedDate = computed(() => concert.value?.dates.find((d) => d.available))

function selectGrade(grade: TicketGrade) {
  selectedGrade.value = grade
}

async function handleSubmit() {
  if (!concert.value || !selectedGrade.value || !selectedDate.value) return
  submitting.value = true
  try {
    const reservation = await reservationApi.create({
      concertId: concert.value.id,
      concertTitle: concert.value.title,
      dateId: selectedDate.value.id,
      track: 'cart',
      gradeId: selectedGrade.value.id,
      gradeLabel: selectedGrade.value.label,
      unitPrice: selectedGrade.value.price,
      quantity: quantity.value,
    })
    paymentStore.setReservation(reservation)
    router.push(`/payment/${reservation.id}`)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
    <Loader2 class="w-8 h-8 animate-spin text-primary" />
  </div>

  <div v-else-if="!concert" class="flex flex-col items-center justify-center min-h-[60vh]">
    <h2 class="font-display text-2xl font-bold text-foreground mb-2">공연을 찾을 수 없습니다</h2>
    <RouterLink to="/" class="text-primary hover:underline">홈으로 돌아가기</RouterLink>
  </div>

  <div v-else class="px-4 lg:px-8 mx-auto max-w-7xl py-8 md:py-12">
    <!-- 헤더 -->
    <div class="flex items-center gap-3 mb-8">
      <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <ShoppingCart class="w-5 h-5 text-primary" />
      </div>
      <div>
        <h1 class="font-display text-2xl font-bold text-foreground">장바구니 예매</h1>
        <p class="text-sm text-muted-foreground">{{ concert.title }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- 좌측: 등급 + 수량 선택 -->
      <div class="lg:col-span-2 space-y-8">
        <!-- 안내 -->
        <div class="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <Info class="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div class="text-sm text-muted-foreground leading-relaxed">
            <p class="font-medium text-foreground mb-1">장바구니 예매 안내</p>
            등급과 수량만 선택하면 좌석은 결제 완료 후 <strong class="text-foreground">랜덤 배정</strong>됩니다.
            최대 2매까지 예매 가능합니다.
          </div>
        </div>

        <!-- 등급 선택 -->
        <section>
          <h2 class="font-display text-lg font-bold text-foreground mb-4">등급 선택</h2>
          <div class="space-y-3">
            <button
              v-for="grade in concert.grades"
              :key="grade.id"
              :disabled="grade.availableSeats <= 0"
              :class="[
                'w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all',
                selectedGrade?.id === grade.id
                  ? 'border-primary bg-primary/10 ring-1 ring-primary'
                  : grade.availableSeats > 0
                    ? 'border-border bg-card hover:border-muted-foreground/30'
                    : 'border-border bg-card opacity-50 cursor-not-allowed',
              ]"
              @click="selectGrade(grade)"
            >
              <div class="flex items-center gap-4">
                <span
                  class="w-12 h-12 rounded-lg bg-primary/10 text-primary font-display font-bold text-base flex items-center justify-center"
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
                  <p class="text-xs text-muted-foreground mt-0.5">
                    잔여 {{ grade.availableSeats }}석
                  </p>
                </div>
              </div>
              <div
                v-if="selectedGrade?.id === grade.id"
                class="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
              >
                <svg class="w-3.5 h-3.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </button>
          </div>
        </section>

        <!-- 수량 선택 -->
        <section v-if="selectedGrade">
          <h2 class="font-display text-lg font-bold text-foreground mb-4">수량 선택</h2>
          <div class="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
            <button
              :disabled="quantity <= 1"
              class="w-10 h-10 rounded-lg border border-border bg-secondary text-foreground flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30"
              @click="quantity = Math.max(1, quantity - 1)"
            >
              <Minus class="w-4 h-4" />
            </button>
            <span class="font-display text-2xl font-bold text-foreground w-8 text-center">
              {{ quantity }}
            </span>
            <button
              :disabled="quantity >= 2"
              class="w-10 h-10 rounded-lg border border-border bg-secondary text-foreground flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30"
              @click="quantity = Math.min(2, quantity + 1)"
            >
              <Plus class="w-4 h-4" />
            </button>
            <span class="text-sm text-muted-foreground">최대 2매</span>
          </div>
        </section>
      </div>

      <!-- 우측: 주문 요약 -->
      <div class="lg:col-span-1">
        <div class="sticky top-24 rounded-xl border border-border bg-card p-6">
          <h3 class="font-display text-lg font-bold text-foreground mb-4">주문 요약</h3>

          <div v-if="!selectedGrade" class="flex items-center gap-2 text-muted-foreground py-8 justify-center">
            <Info class="w-4 h-4" />
            <span class="text-sm">등급을 선택해주세요</span>
          </div>

          <template v-else>
            <div class="space-y-3 mb-4">
              <div>
                <p class="text-xs text-muted-foreground uppercase tracking-wider mb-1">공연</p>
                <p class="text-sm font-medium text-foreground">{{ concert.title }}</p>
              </div>
              <div v-if="selectedDate">
                <p class="text-xs text-muted-foreground uppercase tracking-wider mb-1">일정</p>
                <p class="text-sm text-foreground">{{ selectedDate.venue }}, {{ selectedDate.city }}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground uppercase tracking-wider mb-1">등급</p>
                <p class="text-sm text-foreground">{{ selectedGrade.label }} × {{ quantity }}매</p>
              </div>
            </div>

            <div class="h-px bg-border my-4" />

            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-muted-foreground">{{ selectedGrade.label }} × {{ quantity }}</span>
              <span class="text-sm text-foreground">₩{{ totalPrice.toLocaleString() }}</span>
            </div>

            <div class="h-px bg-border my-4" />

            <div class="flex items-center justify-between mb-6">
              <span class="font-display font-bold text-foreground">합계</span>
              <span class="font-display text-xl font-bold text-foreground">₩{{ totalPrice.toLocaleString() }}</span>
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

            <p class="text-xs text-muted-foreground text-center mt-3">
              좌석은 결제 완료 후 랜덤 배정됩니다.
            </p>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
