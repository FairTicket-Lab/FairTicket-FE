export type PaymentStatus = 'ready' | 'processing' | 'success' | 'fail'
export type PaymentMethod = 'card' | 'kakao' | 'toss'

export interface PaymentRequest {
  reservationId: string
  method: PaymentMethod
}

export interface PaymentResult {
  paymentId: string
  reservationId: string
  status: PaymentStatus
  paidAt?: string
  failReason?: string
}
