import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Seat } from '@/types/seat'

const MAX_SEATS = 4

export const useSeatStore = defineStore('seat', () => {
  const selectedSeats = ref<Seat[]>([])
  const holdId = ref<string | null>(null)
  const holdExpiresAt = ref<string | null>(null)

  const selectedSeatIds = computed(() => selectedSeats.value.map((s) => s.id))
  const isFull = computed(() => selectedSeats.value.length >= MAX_SEATS)
  const remaining = computed(() => MAX_SEATS - selectedSeats.value.length)

  function toggleSeat(seat: Seat) {
    const idx = selectedSeats.value.findIndex((s) => s.id === seat.id)
    if (idx >= 0) {
      selectedSeats.value.splice(idx, 1)
    } else if (!isFull.value) {
      selectedSeats.value.push(seat)
    }
  }

  function setHold(id: string, expiresAt: string) {
    holdId.value = id
    holdExpiresAt.value = expiresAt
  }

  function reset() {
    selectedSeats.value = []
    holdId.value = null
    holdExpiresAt.value = null
  }

  return {
    selectedSeats,
    selectedSeatIds,
    isFull,
    remaining,
    holdId,
    holdExpiresAt,
    toggleSeat,
    setHold,
    reset,
    MAX_SEATS,
  }
})
