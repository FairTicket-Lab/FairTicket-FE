<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Ticket, Loader2, Calendar, Tag } from 'lucide-vue-next'
import type { Reservation } from '@/types/reservation'
import { reservationApi } from '@/api/reservation.api'

const tickets = ref<Reservation[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    tickets.value = await reservationApi.getMyTickets()
  } finally {
    loading.value = false
  }
})

function statusBadge(status: Reservation['status']) {
  switch (status) {
    case 'paid':
      return { text: '결제완료', class: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' }
    case 'pending':
      return { text: '결제대기', class: 'bg-amber-500/20 text-amber-400 border-amber-500/30' }
    case 'cancelled':
      return { text: '취소됨', class: 'bg-destructive/20 text-destructive border-destructive/30' }
    case 'expired':
      return { text: '만료됨', class: 'bg-muted text-muted-foreground border-border' }
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="px-4 lg:px-8 mx-auto max-w-4xl py-8 md:py-12">
    <div class="flex items-center gap-3 mb-8">
      <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <Ticket class="w-5 h-5 text-primary" />
      </div>
      <h1 class="font-display text-2xl font-bold text-foreground">마이 티켓</h1>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <Loader2 class="w-8 h-8 animate-spin text-primary" />
    </div>

    <div v-else-if="tickets.length === 0" class="text-center py-20">
      <Ticket class="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
      <p class="text-muted-foreground mb-4">예매 내역이 없습니다.</p>
      <RouterLink
        to="/"
        class="inline-flex items-center justify-center h-10 px-5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
      >
        공연 둘러보기
      </RouterLink>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="ticket in tickets"
        :key="ticket.id"
        class="rounded-xl border border-border bg-card p-5 md:p-6 transition-all hover:border-muted-foreground/20"
      >
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <!-- 좌측 정보 -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-2">
              <h3 class="font-display font-bold text-foreground text-base truncate">
                {{ ticket.concertTitle }}
              </h3>
              <span
                :class="statusBadge(ticket.status).class"
                class="px-2 py-0.5 text-xs font-semibold rounded-full border shrink-0"
              >
                {{ statusBadge(ticket.status).text }}
              </span>
            </div>

            <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <div class="flex items-center gap-1.5">
                <Tag class="w-3.5 h-3.5" />
                {{ ticket.gradeLabel }} × {{ ticket.quantity }}매
                <span v-if="ticket.track === 'cart'" class="text-xs">(장바구니)</span>
                <span v-else class="text-xs">(당일)</span>
              </div>
              <div class="flex items-center gap-1.5">
                <Calendar class="w-3.5 h-3.5" />
                {{ formatDate(ticket.createdAt) }}
              </div>
            </div>

            <p v-if="ticket.seatId" class="text-xs text-muted-foreground mt-1">
              좌석: {{ ticket.seatId }}
            </p>
            <p class="text-xs text-muted-foreground mt-1 font-mono">
              예매번호: {{ ticket.id }}
            </p>
          </div>

          <!-- 우측 금액 -->
          <div class="text-right shrink-0">
            <p class="font-display text-lg font-bold text-foreground">
              ₩{{ ticket.totalPrice.toLocaleString() }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
