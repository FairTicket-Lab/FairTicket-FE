<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Ticket, Loader2, Calendar, Tag, MapPin, Hash } from 'lucide-vue-next'
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

    <!-- 로딩: Skeleton -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="rounded-xl border border-border bg-card p-6">
        <div class="flex gap-4">
          <div class="w-2 h-20 skeleton rounded-full" />
          <div class="flex-1 space-y-3">
            <div class="h-5 w-1/2 skeleton rounded" />
            <div class="h-4 w-1/3 skeleton rounded" />
            <div class="h-3 w-1/4 skeleton rounded" />
          </div>
          <div class="w-24 h-16 skeleton rounded" />
        </div>
      </div>
    </div>

    <div v-else-if="tickets.length === 0" class="text-center py-20">
      <div class="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
        <Ticket class="w-10 h-10 text-muted-foreground opacity-50" />
      </div>
      <p class="text-lg font-medium text-foreground mb-2">예매 내역이 없습니다</p>
      <p class="text-sm text-muted-foreground mb-6">공연을 둘러보고 티켓을 예매해보세요!</p>
      <RouterLink
        to="/concerts"
        class="inline-flex items-center justify-center h-10 px-5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
      >
        공연 둘러보기
      </RouterLink>
    </div>

    <!-- 실물 티켓 디자인 -->
    <div v-else class="space-y-5">
      <div
        v-for="ticket in tickets"
        :key="ticket.id"
        class="group relative rounded-xl overflow-hidden transition-all hover:shadow-lg hover:shadow-primary/5"
      >
        <!-- 티켓 카드 -->
        <div class="flex flex-col sm:flex-row border border-border bg-card">
          <!-- 좌측: 색상 스트라이프 + 정보 -->
          <div class="flex-1 flex">
            <!-- 등급 색 바 -->
            <div
              class="w-1.5 shrink-0"
              :class="{
                'bg-primary': ticket.status === 'paid',
                'bg-amber-400': ticket.status === 'pending',
                'bg-muted-foreground/30': ticket.status === 'cancelled' || ticket.status === 'expired',
              }"
            />
            <!-- 메인 정보 -->
            <div class="flex-1 p-5">
              <div class="flex items-start justify-between gap-3 mb-3">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <Ticket class="w-4 h-4 text-primary shrink-0" />
                    <span class="text-xs font-semibold text-primary uppercase tracking-wider">FairTicket</span>
                  </div>
                  <h3 class="font-display font-bold text-foreground text-lg truncate">
                    {{ ticket.concertTitle }}
                  </h3>
                </div>
                <span
                  :class="statusBadge(ticket.status).class"
                  class="px-2.5 py-1 text-xs font-semibold rounded-full border shrink-0"
                >
                  {{ statusBadge(ticket.status).text }}
                </span>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div class="flex items-center gap-1.5 text-muted-foreground">
                  <Tag class="w-3.5 h-3.5 shrink-0" />
                  <span>{{ ticket.gradeLabel }} x {{ ticket.quantity }}매</span>
                </div>
                <div class="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar class="w-3.5 h-3.5 shrink-0" />
                  <span class="truncate">{{ formatDate(ticket.createdAt) }}</span>
                </div>
                <div v-if="ticket.seatId" class="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin class="w-3.5 h-3.5 shrink-0" />
                  <span>{{ ticket.seatId }}</span>
                </div>
              </div>

              <div class="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                <Hash class="w-3 h-3" />
                <span class="font-mono">{{ ticket.id }}</span>
                <span class="mx-1 text-border">|</span>
                <span>{{ ticket.track === 'lottery' ? '로터리' : '라이브' }}</span>
              </div>
            </div>
          </div>

          <!-- 절취선 -->
          <div class="hidden sm:flex flex-col items-center py-3 relative">
            <div class="absolute top-0 w-6 h-3 bg-background rounded-b-full" />
            <div class="flex-1 border-l-2 border-dashed border-border" />
            <div class="absolute bottom-0 w-6 h-3 bg-background rounded-t-full" />
          </div>

          <!-- 우측: 금액 + 바코드 -->
          <div class="sm:w-36 flex flex-col items-center justify-center p-4 bg-secondary/30">
            <p class="font-display text-xl font-bold text-foreground mb-3">
              ₩{{ ticket.totalPrice.toLocaleString() }}
            </p>
            <!-- 미니 바코드 -->
            <div class="flex items-center gap-px">
              <div v-for="i in 20" :key="i"
                class="bg-foreground/30"
                :style="{ width: i % 3 === 0 ? '2px' : '1px', height: i % 4 === 0 ? '20px' : '14px' }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
