import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Seat } from '@/types/seat'

export const useSeatStore = defineStore('seat', () => {
  const selectedSeat = ref<Seat | null>(null)
  const holdId = ref<string | null>(null)
  const holdExpiresAt = ref<string | null>(null)

  function selectSeat(seat: Seat) {
    selectedSeat.value = seat
  }

  function setHold(id: string, expiresAt: string) {
    holdId.value = id
    holdExpiresAt.value = expiresAt
  }

  function reset() {
    selectedSeat.value = null
    holdId.value = null
    holdExpiresAt.value = null
  }

  return { selectedSeat, holdId, holdExpiresAt, selectSeat, setHold, reset }
})
