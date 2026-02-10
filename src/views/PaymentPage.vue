<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CreditCard, Clock, Loader2, ShieldCheck } from 'lucide-vue-next'
import { usePaymentStore } from '@/stores/payment.store'
import { reservationApi } from '@/api/reservation.api'
import { useCountdown } from '@/composables/useCountdown'

const route = useRoute()
const router = useRouter()
const paymentStore = usePaymentStore()

const reservationId = route.params.reservationId as string
const loading = ref(true)
const paying = ref(false)
const selectedMethod = ref<'card' | 'kakao' | 'toss'>('card')

onMounted(async () => {
  try {
    if (!paymentStore.reservation || paymentStore.reservation.id !== reservationId) {
      const r = await reservationApi.getById(reservationId)
      if (r) paymentStore.setReservation(r)
      else {
        router.push('/')
        return
      }
    }
  } finally {
    loading.value = false
  }
})

const countdown = useCountdown(paymentStore.reservation?.expiresAt ?? null)
onMounted(() => {
  if (paymentStore.reservation) countdown.start()
})

watch(countdown.isExpired, (expired) => {
  if (expired) router.push('/payment/result?status=expired')
})

const methods = [
  { id: 'card' as const, label: '신용/체크카드', icon: CreditCard },
  { id: 'kakao' as const, label: '카카오페이', icon: ShieldCheck },
  { id: 'toss' as const, label: '토스페이', icon: ShieldCheck },
]

async function handlePay() {
  if (!paymentStore.reservation) return
  paying.value = true
  paymentStore.setStatus('processing')
  try {
    // PoC — 목 결제 (1.5초 딜레이)
    await new Promise((r) => setTimeout(r, 1500))
    await reservationApi.pay(paymentStore.reservation!.id)
    paymentStore.setStatus('success')
    router.push('/payment/result?status=success')
  } catch {
    paymentStore.setStatus('fail', '결제에 실패했습니다.')
    router.push('/payment/result?status=fail')
  }
}
</script>

<template>
  <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
    <Loader2 class="w-8 h-8 animate-spin text-primary" />
  </div>

  <div v-else-if="paymentStore.reservation" class="px-4 lg:px-8 mx-auto max-w-7xl py-8 md:py-12">
    <!-- 타이머 -->
    <div class="flex items-center justify-center gap-2 mb-8 px-4 py-3 rounded-full border border-border bg-card w-fit mx-auto">
      <Clock class="w-4 h-4 text-primary" />
      <span class="text-sm text-muted-foreground">결제 제한 시간</span>
      <span
        class="font-display font-bold text-lg"
        :class="countdown.remaining.value < 60 ? 'text-destructive' : 'text-foreground'"
      >
        {{ countdown.display.value }}
      </span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- 좌측: 결제 수단 -->
      <div class="lg:col-span-2 space-y-6">
        <section>
          <h2 class="font-display text-xl font-bold text-foreground mb-4">결제 수단 선택</h2>
          <div class="space-y-3">
            <button
              v-for="method in methods"
              :key="method.id"
              :class="[
                'w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all',
                selectedMethod === method.id
                  ? 'border-primary bg-primary/10 ring-1 ring-primary'
                  : 'border-border bg-card hover:border-muted-foreground/30',
              ]"
              @click="selectedMethod = method.id"
            >
              <div class="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <component :is="method.icon" class="w-5 h-5 text-foreground" />
              </div>
              <span class="text-sm font-medium text-foreground">{{ method.label }}</span>
              <div
                v-if="selectedMethod === method.id"
                class="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center"
              >
                <svg class="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </button>
          </div>
        </section>

        <!-- 결제 처리 중 오버레이 -->
        <div
          v-if="paying"
          class="flex flex-col items-center justify-center py-16"
        >
          <Loader2 class="w-12 h-12 animate-spin text-primary mb-4" />
          <p class="font-display text-lg font-bold text-foreground">결제 처리 중...</p>
          <p class="text-sm text-muted-foreground mt-1">잠시만 기다려주세요</p>
        </div>
      </div>

      <!-- 우측: 주문 요약 -->
      <div class="lg:col-span-1">
        <div class="sticky top-24 rounded-xl border border-border bg-card p-6">
          <h3 class="font-display text-lg font-bold text-foreground mb-4">주문 요약</h3>

          <div class="space-y-3 mb-4">
            <div>
              <p class="text-xs text-muted-foreground uppercase tracking-wider mb-1">공연</p>
              <p class="text-sm font-medium text-foreground">{{ paymentStore.reservation.concertTitle }}</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground uppercase tracking-wider mb-1">트랙</p>
              <p class="text-sm text-foreground">
                {{ paymentStore.reservation.track === 'cart' ? '장바구니 예매' : '당일 예매' }}
              </p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground uppercase tracking-wider mb-1">등급 / 수량</p>
              <p class="text-sm text-foreground">
                {{ paymentStore.reservation.gradeLabel }} × {{ paymentStore.reservation.quantity }}매
              </p>
            </div>
            <div v-if="paymentStore.reservation.seatId">
              <p class="text-xs text-muted-foreground uppercase tracking-wider mb-1">좌석</p>
              <p class="text-sm text-foreground">{{ paymentStore.reservation.seatId }}</p>
            </div>
          </div>

          <div class="h-px bg-border my-4" />

          <div class="flex items-center justify-between mb-6">
            <span class="font-display font-bold text-foreground">합계</span>
            <span class="font-display text-xl font-bold text-foreground">
              ₩{{ paymentStore.reservation.totalPrice.toLocaleString() }}
            </span>
          </div>

          <button
            :disabled="paying"
            class="w-full h-12 rounded-full bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            @click="handlePay"
          >
            <Loader2 v-if="paying" class="w-4 h-4 animate-spin" />
            {{ paying ? '결제 중...' : `₩${paymentStore.reservation.totalPrice.toLocaleString()} 결제하기` }}
          </button>

          <p class="text-xs text-muted-foreground text-center mt-3">
            결제 시 이용약관에 동의하는 것으로 간주합니다.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
