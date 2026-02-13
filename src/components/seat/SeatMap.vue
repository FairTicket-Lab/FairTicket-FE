<script setup lang="ts">
import type { Seat, SeatSection } from '@/types/seat'

const props = defineProps<{
  sections: SeatSection[]
  selectedSeatIds: string[]
  sectionLabel?: string
}>()

const emit = defineEmits<{
  select: [seat: Seat]
}>()

const gradeColors: Record<string, { fill: string; stroke: string }> = {
  vip: { fill: '#7B3FA0', stroke: '#6A2E8F' },
  r: { fill: '#2563EB', stroke: '#1D4ED8' },
  s: { fill: '#8B9EC8', stroke: '#7A8DB7' },
  a: { fill: '#D4884E', stroke: '#C87B41' },
}

function isSelected(seatId: string) {
  return props.selectedSeatIds.includes(seatId)
}

function seatColor(seat: Seat) {
  if (isSelected(seat.id)) return { fill: '#EC4899', stroke: '#DB2777' }
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
      <!-- Stage direction -->
      <rect x="200" y="10" width="300" height="32" rx="16" fill="hsl(265,85%,60%)" opacity="0.3" />
      <text x="350" y="32" text-anchor="middle" fill="white" font-size="13" font-weight="600">
        ↑ STAGE
      </text>

      <!-- Section label -->
      <text
        v-if="sectionLabel"
        x="350" y="62"
        text-anchor="middle" fill="hsl(265,85%,60%)" font-size="16" font-weight="700"
      >{{ sectionLabel }}</text>

      <!-- Seats -->
      <template v-for="section in sections" :key="section.id">
        <g v-for="seat in section.seats" :key="seat.id">
          <rect
            :x="seat.x"
            :y="seat.y"
            width="22"
            height="22"
            rx="4"
            :fill="seatColor(seat).fill"
            :stroke="seatColor(seat).stroke"
            stroke-width="1.5"
            :class="[
              seat.status === 'available' ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed',
              isSelected(seat.id) ? 'animate-pulse' : '',
            ]"
            @click="seat.status === 'available' && emit('select', seat)"
          />
          <text
            v-if="isSelected(seat.id)"
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
