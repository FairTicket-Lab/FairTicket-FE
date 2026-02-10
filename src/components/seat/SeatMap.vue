<script setup lang="ts">
import type { Seat, SeatSection } from '@/types/seat'

defineProps<{
  sections: SeatSection[]
  selectedSeatId: string | null
}>()

const emit = defineEmits<{
  select: [seat: Seat]
}>()

const gradeColors: Record<string, { fill: string; stroke: string }> = {
  vip: { fill: '#7C3AED', stroke: '#6D28D9' },
  r: { fill: '#2563EB', stroke: '#1D4ED8' },
  s: { fill: '#059669', stroke: '#047857' },
  a: { fill: '#D97706', stroke: '#B45309' },
}

function seatColor(seat: Seat, isSelected: boolean) {
  if (isSelected) return { fill: '#EC4899', stroke: '#DB2777' }
  if (seat.status === 'sold') return { fill: '#27272A', stroke: '#3F3F46' }
  if (seat.status === 'held') return { fill: '#52525B', stroke: '#71717A' }
  return gradeColors[seat.gradeId] ?? { fill: '#6B7280', stroke: '#4B5563' }
}
</script>

<template>
  <div class="w-full overflow-x-auto">
    <svg
      viewBox="0 0 700 560"
      class="w-full min-w-[500px] h-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- 스테이지 -->
      <rect x="200" y="20" width="300" height="40" rx="20" fill="hsl(265,85%,60%)" opacity="0.3" />
      <text x="350" y="46" text-anchor="middle" fill="white" font-size="14" font-weight="600">STAGE</text>

      <!-- 좌석 -->
      <template v-for="section in sections" :key="section.id">
        <g v-for="seat in section.seats" :key="seat.id">
          <rect
            :x="seat.x"
            :y="seat.y"
            width="22"
            height="22"
            rx="4"
            :fill="seatColor(seat, selectedSeatId === seat.id).fill"
            :stroke="seatColor(seat, selectedSeatId === seat.id).stroke"
            stroke-width="1.5"
            :class="[
              seat.status === 'available' ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed',
              selectedSeatId === seat.id ? 'animate-pulse' : '',
            ]"
            @click="seat.status === 'available' && emit('select', seat)"
          />
          <text
            v-if="selectedSeatId === seat.id"
            :x="seat.x + 11"
            :y="seat.y + 15"
            text-anchor="middle"
            fill="white"
            font-size="10"
            font-weight="700"
          >
            ✓
          </text>
        </g>
      </template>
    </svg>
  </div>
</template>
