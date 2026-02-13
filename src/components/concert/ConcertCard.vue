<script setup lang="ts">
import { computed } from 'vue'
import { CalendarDays, MapPin } from 'lucide-vue-next'
import type { Concert } from '@/types/concert'

const props = defineProps<{ concert: Concert }>()

const nextDate = computed(() => props.concert.dates.find((d) => d.available))

const formattedDate = computed(() => {
  if (!nextDate.value) return ''
  return new Date(nextDate.value.date).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  })
})

const lowestPrice = computed(() => Math.min(...props.concert.grades.map((g) => g.price)))

const statusBadge = computed(() => {
  switch (props.concert.saleStatus) {
    case 'on-sale':
      return { text: '예매중', class: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' }
    case 'coming-soon':
      return { text: '예매예정', class: 'bg-amber-500/20 text-amber-400 border-amber-500/30' }
    case 'sold-out':
      return { text: '매진', class: 'bg-destructive/20 text-destructive border-destructive/30' }
  }
})
</script>

<template>
  <RouterLink :to="`/concerts/${concert.id}`" class="group block">
    <div
      class="relative rounded-xl overflow-hidden bg-card border border-border transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-lg group-hover:shadow-primary/5"
    >
      <!-- 이미지 -->
      <div class="relative aspect-[16/10] overflow-hidden">
        <img
          :src="concert.image"
          :alt="concert.title"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        <div class="absolute top-3 left-3">
          <span
            :class="statusBadge.class"
            class="px-2.5 py-0.5 text-xs font-semibold rounded-full border"
          >
            {{ statusBadge.text }}
          </span>
        </div>
      </div>

      <!-- 정보 -->
      <div class="p-4">
        <h3
          class="font-display font-bold text-foreground text-base mb-1 truncate group-hover:text-primary transition-colors"
        >
          {{ concert.title }}
        </h3>
        <p class="text-sm text-muted-foreground mb-3">{{ concert.artist }}</p>

        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-1">
            <div v-if="nextDate" class="flex items-center gap-1.5 text-muted-foreground">
              <CalendarDays class="w-3.5 h-3.5" />
              <span class="text-xs">{{ formattedDate }}</span>
            </div>
            <div v-if="nextDate" class="flex items-center gap-1.5 text-muted-foreground">
              <MapPin class="w-3.5 h-3.5" />
              <span class="text-xs">{{ nextDate.venue }}</span>
            </div>
          </div>
          <div class="text-right">
            <p class="text-xs text-muted-foreground">From</p>
            <p class="font-display font-bold text-foreground">
              ₩{{ lowestPrice.toLocaleString() }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </RouterLink>
</template>
