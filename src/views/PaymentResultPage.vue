<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { CheckCircle, XCircle, Clock, ArrowRight, Ticket } from 'lucide-vue-next'
import { usePaymentStore } from '@/stores/payment.store'
import ConfettiCanvas from '@/components/ui/ConfettiCanvas.vue'

const route = useRoute()
const paymentStore = usePaymentStore()

const status = computed(() => (route.query.status as string) || 'fail')

const isSuccess = computed(() => status.value === 'success')
const isExpired = computed(() => status.value === 'expired')
</script>

<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md text-center">
      <!-- 성공 + Confetti -->
      <template v-if="isSuccess">
        <ConfettiCanvas />

        <div class="relative">
          <div class="absolute inset-0 w-24 h-24 mx-auto rounded-full bg-emerald-500/20 animate-ping" style="animation-duration: 2s; animation-iteration-count: 3" />
          <div class="relative w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle class="w-12 h-12 text-emerald-400" />
          </div>
        </div>
        <h1 class="font-display text-3xl font-bold text-foreground mb-2">결제 완료!</h1>
        <p class="text-muted-foreground mb-8">티켓이 성공적으로 예매되었습니다.</p>

        <!-- 티켓 카드 (실물 디자인) -->
        <div v-if="paymentStore.reservation" class="relative mx-auto max-w-sm mb-8">
          <div class="rounded-xl border border-emerald-500/30 bg-card overflow-hidden">
            <!-- 상단 -->
            <div class="bg-gradient-to-r from-primary/20 to-emerald-500/20 p-5">
              <div class="flex items-center gap-2 mb-3">
                <Ticket class="w-5 h-5 text-primary" />
                <span class="text-xs font-semibold text-primary uppercase tracking-wider">FairTicket</span>
              </div>
              <p class="font-display font-bold text-foreground text-lg text-left">
                {{ paymentStore.reservation.concertTitle }}
              </p>
            </div>
            <!-- 절취선 -->
            <div class="relative h-6 flex items-center">
              <div class="absolute left-0 w-3 h-6 bg-background rounded-r-full" />
              <div class="flex-1 border-t-2 border-dashed border-border mx-4" />
              <div class="absolute right-0 w-3 h-6 bg-background rounded-l-full" />
            </div>
            <!-- 하단 정보 -->
            <div class="p-5 space-y-3 text-left">
              <div class="flex justify-between">
                <div>
                  <p class="text-xs text-muted-foreground uppercase tracking-wider mb-1">예매 번호</p>
                  <p class="text-sm font-mono text-primary font-bold">{{ paymentStore.reservation.id }}</p>
                </div>
                <div class="text-right">
                  <p class="text-xs text-muted-foreground uppercase tracking-wider mb-1">결제 금액</p>
                  <p class="text-sm font-bold text-foreground">₩{{ paymentStore.reservation.totalPrice.toLocaleString() }}</p>
                </div>
              </div>
              <div class="flex justify-between">
                <div>
                  <p class="text-xs text-muted-foreground uppercase tracking-wider mb-1">등급</p>
                  <p class="text-sm text-foreground">{{ paymentStore.reservation.gradeLabel }}</p>
                </div>
                <div class="text-right">
                  <p class="text-xs text-muted-foreground uppercase tracking-wider mb-1">수량</p>
                  <p class="text-sm text-foreground">{{ paymentStore.reservation.quantity }}매</p>
                </div>
              </div>
              <!-- 바코드 느낌 -->
              <div class="pt-3 flex items-center justify-center gap-px">
                <div v-for="i in 30" :key="i"
                  class="bg-foreground/40"
                  :style="{ width: i % 3 === 0 ? '3px' : '1.5px', height: i % 5 === 0 ? '28px' : '22px' }"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <RouterLink
            to="/my/tickets"
            class="inline-flex items-center justify-center h-11 px-6 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25 gap-2"
          >
            마이 티켓 보기
            <ArrowRight class="w-4 h-4" />
          </RouterLink>
          <RouterLink
            to="/"
            class="inline-flex items-center justify-center h-11 px-6 rounded-full border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-colors"
          >
            홈으로
          </RouterLink>
        </div>
      </template>

      <!-- 만료 -->
      <template v-else-if="isExpired">
        <div class="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
          <Clock class="w-10 h-10 text-amber-400" />
        </div>
        <h1 class="font-display text-2xl font-bold text-foreground mb-2">결제 시간 만료</h1>
        <p class="text-muted-foreground mb-8">결제 제한 시간이 초과되었습니다.<br />다시 예매해주세요.</p>
        <RouterLink
          to="/"
          class="inline-flex items-center justify-center h-11 px-6 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors gap-2"
        >
          홈으로 돌아가기
          <ArrowRight class="w-4 h-4" />
        </RouterLink>
      </template>

      <!-- 실패 -->
      <template v-else>
        <div class="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
          <XCircle class="w-10 h-10 text-destructive" />
        </div>
        <h1 class="font-display text-2xl font-bold text-foreground mb-2">결제 실패</h1>
        <p class="text-muted-foreground mb-8">
          {{ paymentStore.failReason || '결제 처리 중 오류가 발생했습니다.' }}
        </p>
        <RouterLink
          to="/"
          class="inline-flex items-center justify-center h-11 px-6 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors gap-2"
        >
          홈으로 돌아가기
          <ArrowRight class="w-4 h-4" />
        </RouterLink>
      </template>
    </div>
  </div>
</template>
