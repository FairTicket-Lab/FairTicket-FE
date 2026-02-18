<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Ticket, Minus, Plus, Info, Loader2, ArrowRight } from 'lucide-vue-next'
import type { Concert } from '@/types/concert'
import { concertApi } from '@/api/concert.api'
import { reservationApi } from '@/api/reservation.api'
import { usePaymentStore } from '@/stores/payment.store'
import { useQueueStore } from '@/stores/queue.store'

const route = useRoute()
const router = useRouter()
const paymentStore = usePaymentStore()
const queueStore = useQueueStore()

const concertId = route.params.concertId as string
const concert = ref<Concert | null>(null)
const loading = ref(true)
const submitting = ref(false)
const errorMessage = ref('')

// 등급별 수량 (gradeId → quantity)
const gradeQuantities = reactive<Record<string, number>>({})

onMounted(async () => {
  // 토큰 없으면 대기열로 리다이렉트
  if (!queueStore.readyToken) {
    router.replace(`/queue/${concertId}?track=lottery`)
    return
  }
  try {
    concert.value = (await concertApi.getById(concertId)) ?? null
    if (concert.value) {
      for (const g of concert.value.grades) {
        gradeQuantities[g.id] = 0
      }
    }
  } finally {
    loading.value = false
  }
})

const totalQuantity = computed(() =>
  Object.values(gradeQuantities).reduce((sum, q) => sum + q, 0)
)

const totalPrice = computed(() => {
  if (!concert.value) return 0
  return concert.value.grades.reduce((sum, g) => {
    return sum + g.price * (gradeQuantities[g.id] ?? 0)
  }, 0)
})

const selectedDate = computed(() => concert.value?.dates.find((d) => d.available))

// 선택된 등급 목록 (수량 > 0)
const selectedItems = computed(() => {
  if (!concert.value) return []
  return concert.value.grades
    .filter((g) => (gradeQuantities[g.id] ?? 0) > 0)
    .map((g) => ({ ...g, qty: gradeQuantities[g.id]! }))
})

function increment(gradeId: string) {
  if (totalQuantity.value >= 2) return
  gradeQuantities[gradeId] = (gradeQuantities[gradeId] ?? 0) + 1
}

function decrement(gradeId: string) {
  if ((gradeQuantities[gradeId] ?? 0) <= 0) return
  gradeQuantities[gradeId]!--
}

async function handleSubmit() {
  if (!concert.value || !selectedDate.value || selectedItems.value.length === 0) return
  submitting.value = true
  errorMessage.value = ''
  try {
    const gradeLabel = selectedItems.value
      .map((item) => `${item.label} x${item.qty}`)
      .join(', ')
    const gradeId = selectedItems.value.map((item) => item.id).join(',')

    const reservation = await reservationApi.createLottery({
      scheduleId: concertId,
      grade: selectedItems.value[0].label,
      quantity: totalQuantity.value,
      token: queueStore.readyToken!,
      concertTitle: concert.value.title,
      gradeId,
      gradeLabel,
      unitPrice: Math.round(totalPrice.value / totalQuantity.value),
    })
    reservation.totalPrice = totalPrice.value
    paymentStore.setReservation(reservation)
    router.push(`/payment/${reservation.id}`)
  } catch (e: unknown) {
    const msg =
      (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      ?? '로터리 신청 중 오류가 발생했습니다.'
    errorMessage.value = msg
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
  <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
    <Loader2 class="w-8 h-8 animate-spin text-primary" />
  </div>

  <div v-else-if="!concert" class="flex flex-col items-center justify-center min-h-[60vh]">
    <h2 class="font-display text-2xl font-bold text-foreground mb-2">공연을 찾을 수 없습니다</h2>
    <RouterLink to="/concerts" class="text-primary hover:underline">홈으로 돌아가기</RouterLink>
  </div>

  <div v-else class="px-4 lg:px-8 mx-auto max-w-7xl py-8 md:py-12">
    <!-- 헤더 -->
    <div class="flex items-center gap-3 mb-8">
      <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <Ticket class="w-5 h-5 text-primary" />
      </div>
      <div>
        <h1 class="font-display text-2xl font-bold text-foreground">로터리 예매</h1>
        <p class="text-sm text-muted-foreground">{{ concert.title }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- 좌측: 등급별 수량 선택 -->
      <div class="lg:col-span-2 space-y-8">
        <!-- 안내 -->
        <div class="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <Info class="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div class="text-sm text-muted-foreground leading-relaxed">
            <p class="font-medium text-foreground mb-1">로터리 예매 안내</p>
            등급별 수량을 선택하면 로터리 후 당첨자에게 좌석이 <strong class="text-foreground">랜덤 배정</strong>됩니다.
            총 <strong class="text-foreground">2매</strong>까지 신청 가능하며, 서로 다른 등급을 조합할 수 있습니다.
          </div>
        </div>

        <!-- 등급별 수량 선택 -->
        <section>
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-display text-lg font-bold text-foreground">등급 및 수량 선택</h2>
            <span class="text-sm font-medium" :class="totalQuantity > 0 ? 'text-primary' : 'text-muted-foreground'">
              {{ totalQuantity }} / 2매
            </span>
          </div>
          <div class="space-y-3">
            <div
              v-for="grade in concert.grades"
              :key="grade.id"
              :class="[
                'flex items-center justify-between p-4 rounded-xl border transition-all',
                (gradeQuantities[grade.id] ?? 0) > 0
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                  : grade.availableSeats > 0
                    ? 'border-border bg-card'
                    : 'border-border bg-card opacity-50',
              ]"
            >
              <!-- 등급 정보 -->
              <div class="flex items-center gap-4">
                <span
                  class="w-12 h-12 rounded-lg font-display font-bold text-base flex items-center justify-center"
                  :class="(gradeQuantities[grade.id] ?? 0) > 0
                    ? 'bg-primary/20 text-primary'
                    : 'bg-primary/10 text-primary'"
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

              <!-- 수량 스테퍼 -->
              <div class="flex items-center gap-3">
                <button
                  :disabled="(gradeQuantities[grade.id] ?? 0) <= 0"
                  class="w-9 h-9 rounded-lg border border-border bg-secondary text-foreground flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  @click="decrement(grade.id)"
                >
                  <Minus class="w-4 h-4" />
                </button>
                <span
                  class="font-display text-xl font-bold w-6 text-center"
                  :class="(gradeQuantities[grade.id] ?? 0) > 0 ? 'text-primary' : 'text-muted-foreground'"
                >
                  {{ gradeQuantities[grade.id] ?? 0 }}
                </span>
                <button
                  :disabled="grade.availableSeats <= 0 || totalQuantity >= 2"
                  class="w-9 h-9 rounded-lg border border-border bg-secondary text-foreground flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  @click="increment(grade.id)"
                >
                  <Plus class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- 2매 도달 안내 -->
          <p v-if="totalQuantity >= 2" class="text-xs text-amber-400 mt-3 flex items-center gap-1.5">
            <Info class="w-3.5 h-3.5" />
            최대 수량(2매)에 도달했습니다.
          </p>
        </section>
      </div>

      <!-- 우측: 주문 요약 -->
      <div class="lg:col-span-1">
        <div class="sticky top-24 rounded-xl border border-border bg-card p-6">
          <h3 class="font-display text-lg font-bold text-foreground mb-4">주문 요약</h3>

          <div v-if="selectedItems.length === 0" class="flex items-center gap-2 text-muted-foreground py-8 justify-center">
            <Info class="w-4 h-4" />
            <span class="text-sm">등급과 수량을 선택해주세요</span>
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
                <p class="text-xs text-muted-foreground uppercase tracking-wider mb-1">선택 등급</p>
                <div class="space-y-1">
                  <p v-for="item in selectedItems" :key="item.id" class="text-sm text-foreground">
                    {{ item.label }} x {{ item.qty }}매
                  </p>
                </div>
              </div>
            </div>

            <div class="h-px bg-border my-4" />

            <!-- 등급별 소계 -->
            <div class="space-y-2 mb-4">
              <div v-for="item in selectedItems" :key="item.id" class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">{{ item.label }} x {{ item.qty }}</span>
                <span class="text-sm text-foreground">₩{{ (item.price * item.qty).toLocaleString() }}</span>
              </div>
            </div>

            <div class="h-px bg-border my-4" />

            <div class="flex items-center justify-between mb-6">
              <span class="font-display font-bold text-foreground">합계</span>
              <span class="font-display text-xl font-bold text-foreground">₩{{ totalPrice.toLocaleString() }}</span>
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

            <p v-if="errorMessage" class="text-sm text-destructive text-center mt-3">
              {{ errorMessage }}
            </p>
            <p class="text-xs text-muted-foreground text-center mt-3">
              로터리 당첨 시 좌석이 랜덤 배정됩니다.
            </p>
          </template>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>
