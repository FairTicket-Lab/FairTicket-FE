import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Reservation } from '@/types/reservation'
import type { PaymentStatus } from '@/types/payment'

export const usePaymentStore = defineStore('payment', () => {
  const reservation = ref<Reservation | null>(null)
  const paymentStatus = ref<PaymentStatus>('ready')
  const failReason = ref<string | null>(null)

  function setReservation(r: Reservation) {
    reservation.value = r
    paymentStatus.value = 'ready'
    failReason.value = null
  }

  function setStatus(s: PaymentStatus, reason?: string) {
    paymentStatus.value = s
    if (reason) failReason.value = reason
  }

  function reset() {
    reservation.value = null
    paymentStatus.value = 'ready'
    failReason.value = null
  }

  return { reservation, paymentStatus, failReason, setReservation, setStatus, reset }
})
