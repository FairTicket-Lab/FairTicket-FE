export type ReservationStatus = 'pending' | 'paid' | 'cancelled' | 'expired'
export type TrackType = 'cart' | 'realtime'

export interface Reservation {
  id: string
  concertId: string
  concertTitle: string
  dateId: string
  track: TrackType
  gradeId: string
  gradeLabel: string
  seatId?: string // 당일 트랙만
  quantity: number // 장바구니 트랙은 1~2
  unitPrice: number
  totalPrice: number
  status: ReservationStatus
  createdAt: string
  expiresAt: string // 결제 기한
}
